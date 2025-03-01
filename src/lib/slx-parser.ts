// lib/parse-simulink.ts
import AdmZip from "adm-zip";
import { XMLParser } from "fast-xml-parser";
import he from "he";

/** 提取中心坐标，仅用于绘图 */
function parsePosition(str: string) {
  const match = /\[([\-\d]+),\s*([\-\d]+),\s*([\-\d]+),\s*([\-\d]+)\]/.exec(
    str
  );
  if (!match) return { x: 0, y: 0 };
  const x1 = parseInt(match[1], 10);
  const y1 = parseInt(match[2], 10);
  const x2 = parseInt(match[3], 10);
  const y2 = parseInt(match[4], 10);
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
}

/** 解析 <PortProperties> => portProps[] */
function parsePortProperties(portPropsNode: any) {
  // 示例:
  // <Port Type="out" Index="1">
  //   <P Name="PropagatedSignals">After Conditioning</P>
  // </Port>
  // 返回: [ { type, index, props: { PropagatedSignals: "After Conditioning", ... } }, ... ]
  if (!portPropsNode) return [];

  const ports: any[] = portPropsNode.Port
    ? Array.isArray(portPropsNode.Port)
      ? portPropsNode.Port
      : [portPropsNode.Port]
    : [];

  return ports.map((port: any) => {
    const type = port["@_Type"] || "";
    const index = parseInt(port["@_Index"] || "1", 10);

    // 收集 <P> Name=..., #text
    const props: Record<string, string> = {};
    if (port.P) {
      const pArr = Array.isArray(port.P) ? port.P : [port.P];
      pArr.forEach((p: Record<string, string>) => {
        const pName: string | undefined = p["@_Name"];
        if (pName) {
          const value = p["#text"] || "";
          props[pName] = he.decode(value);
        }
      });
    }

    return { type, index, props };
  });
}

/** 解析 <Block> -> ReactFlow Node */
function parseBlock(block: any) {
  const sid = block["@_SID"]?.toString() || "";
  const name = he.decode(block["@_Name"] || "Unnamed");
  const blockType = block["@_BlockType"] || "default";

  // 默认坐标(0,0)
  let x = 0,
    y = 0;

  // 解析 PortCounts
  let portInCount = 1;
  let portOutCount = 1;
  if (block.PortCounts) {
    if (block.PortCounts["@_in"]) {
      portInCount = parseInt(block.PortCounts["@_in"], 10) || 1;
    }
    if (block.PortCounts["@_out"]) {
      portOutCount = parseInt(block.PortCounts["@_out"], 10) || 1;
    }
  }

  // 解析 PortProperties
  const portProps = parsePortProperties(block.PortProperties);

  // 收集其他属性
  const attributes: Record<string, string> = {};
  if (block.P) {
    const pArray = Array.isArray(block.P) ? block.P : [block.P];
    for (const p of pArray) {
      const pName = p["@_Name"];
      const pVal = p["#text"] || "";
      if (!pName) continue;

      // Position => 解析坐标
      if (pName === "Position") {
        const { x: px, y: py } = parsePosition(pVal);
        x = px;
        y = py;
        continue;
      }
      // ZOrder => 忽略
      if (pName === "ZOrder") {
        continue;
      }
      // 其它 => attributes
      attributes[pName] = pVal;
    }
  }

  return {
    id: sid,
    type: blockType === "SubSystem" ? "subsystem" : "node",
    position: { x, y },
    data: {
      id: sid,
      label: name,
      blockType,
      attributes,
      name,
      portInCount,
      portOutCount,
      portProps,
    },
  };
}

/** 解析 <Line> -> edges，支持 handle: #out:1 => "out-1", #in:2 => "in-2" */
function parseLine(line: any, nodes: any[], globalIndex: number) {
  const edges: any[] = [];
  let edgeIndex = globalIndex;

  const pArray = Array.isArray(line.P) ? line.P : [line.P];
  const srcText = pArray.find((p: any) => p["@_Name"] === "Src")?.["#text"];
  const dstText = pArray.find((p: any) => p["@_Name"] === "Dst")?.["#text"];

  /** 把 "SID#out:1" => { nodeId: "SID", handle: "out-1" } */
  const parseSrcDst = (txt: string) => {
    if (!txt) return null;
    const [sid, handleRaw] = txt.split("#");
    if (!sid || !handleRaw) return null;
    // handleRaw like "out:1"
    const match = handleRaw.match(/(\w+):(\d+)/);
    if (!match) return { sid, handle: "" };
    const dir = match[1]; // out / in
    const idx = match[2]; // "1"
    return { sid, handle: `${dir}-${idx}` };
  };

  const addEdge = (sourceTxt: string, targetTxt: string) => {
    if (!sourceTxt || !targetTxt) return;
    const s = parseSrcDst(sourceTxt);
    const t = parseSrcDst(targetTxt);
    if (!s || !t) return;
    // 确保节点存在
    if (
      !nodes.some((n) => n.id === s.sid) ||
      !nodes.some((n) => n.id === t.sid)
    ) {
      return;
    }
    edges.push({
      id: `e${edgeIndex++}`,
      source: s.sid,
      sourceHandle: s.handle, // e.g. "out-1"
      target: t.sid,
      targetHandle: t.handle, // e.g. "in-1"
      animated: true,
    });
  };

  addEdge(srcText, dstText);

  // Branch
  if (line.Branch) {
    const branches = Array.isArray(line.Branch) ? line.Branch : [line.Branch];
    branches.forEach((branch: any) => {
      const bpArray = Array.isArray(branch.P) ? branch.P : [branch.P];
      const branchDst = bpArray.find((p: any) => p["@_Name"] === "Dst")?.[
        "#text"
      ];
      addEdge(srcText, branchDst);
    });
  }

  return { edges, nextIndex: edgeIndex };
}

/** 解析 system_*.xml -> { nodes, edges } */
function parseSystemXml(xmlContent: string) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
  });
  const jsonData = parser.parse(xmlContent);

  let blocks: any[] = jsonData.System?.Block || [];
  let lines: any[] = jsonData.System?.Line || [];
  if (!Array.isArray(blocks)) blocks = blocks ? [blocks] : [];
  if (!Array.isArray(lines)) lines = lines ? [lines] : [];

  const nodes = blocks.map((b: any) => parseBlock(b));
  let edges: ReturnType<typeof parseLine>["edges"] = [];
  let edgeGlobalIndex = 0;
  for (const ln of lines) {
    const { edges: lineEdges, nextIndex } = parseLine(
      ln,
      nodes,
      edgeGlobalIndex
    );
    edges.push(...lineEdges);
    edgeGlobalIndex = nextIndex;
  }

  return { nodes, edges };
}

/** 对外暴露: parseSlxBuffer(buffer) -> { rootNodes, rootEdges, subsystems } */
export function parseSlxBuffer(buffer: Buffer) {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
  const fileList = entries.map((e) => e.entryName);

  const rootPath = "simulink/systems/system_root.xml";
  if (!fileList.includes(rootPath)) {
    throw new Error("No system_root.xml found in SLX");
  }
  const rootXml = zip.readAsText(rootPath);
  const rootData = parseSystemXml(rootXml);

  // 收集子系统
  const subsystemPaths = fileList.filter(
    (f) =>
      f.startsWith("simulink/systems/system_") &&
      f.endsWith(".xml") &&
      f !== rootPath
  );

  const subsystems: Record<
    string,
    { nodes: typeof rootData.nodes; edges: typeof rootData.edges }
  > = {};
  for (const sp of subsystemPaths) {
    const sid = sp.split("_")[1].replace(".xml", "");
    const content = zip.readAsText(sp);
    subsystems[sid] = parseSystemXml(content);
  }

  return {
    root: {
      nodes: rootData.nodes,
      edges: rootData.edges,
    },
    subsystems,
  };
}
