"use client";

import React, { memo } from "react";
import { Handle, NodeProps, NodeResizer, Position } from "@xyflow/react";
import { useRouter } from "next/navigation";
import PortalTooltip from "./PortalTooltip";
import { parseSlxBuffer } from "@/lib/slx-parser";

/**
 * 自定义节点组件：
 * - 多输入/输出端口
 * - SubSystem => 底部按钮可点击进入 /view/[id]
 * - Tooltip 使用 PortalTooltip, 避免被父容器裁剪
 */

export default memo(function CustomNode(props: NodeProps) {
  const data = props.data as unknown as ReturnType<
    typeof parseSlxBuffer
  >["root"]["nodes"][number]["data"];

  const {
    blockType = "Unknown",
    name = "Unnamed",
    attributes = {},
    portProps = [],
    portInCount = 1,
    portOutCount = 1,
    id,
  } = data;

  // 是否是 SubSystem
  const isSubSystem = blockType === "SubSystem" && !!id;
  const router = useRouter();

  // 用来定位 tooltip
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = React.useState(false);
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 });

  // 计算 tooltip 位置
  const handleMouseEnter = (e: React.MouseEvent) => {
    setHovered(true);
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      setTooltipPos({
        x: rect.right + 10,
        y: rect.top + window.scrollY,
      });
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  // 生成左侧输入端口
  const inHandles = Array.from({ length: portInCount }, (_, i) => {
    const topPercent = ((i + 1) * 100) / (portInCount + 1);
    return (
      <Handle
        key={`in-${i + 1}`}
        type="target"
        position={Position.Left}
        id={`in-${i + 1}`}
        style={{ top: `${topPercent}%`, background: "#4a5" }} // 绿色
      />
    );
  });

  // 生成右侧输出端口
  const outHandles = Array.from({ length: portOutCount }, (_, i) => {
    const topPercent = ((i + 1) * 100) / (portOutCount + 1);
    return (
      <Handle
        key={`out-${i + 1}`}
        type="source"
        position={Position.Right}
        id={`out-${i + 1}`}
        style={{ top: `${topPercent}%`, background: "#09f" }} // 蓝色
      />
    );
  });

  // 点击 SubSystem 按钮，跳转到 /view/[id]
  const handleSubSystemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/view/${id}`);
  };

  // **✅ 样式优化**
  const nodeStyle: React.CSSProperties = {
    color: "#eee",
    borderRadius: 10,
    backdropFilter: "blur(0.2rem)",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "12px",
    cursor: "move",
    textAlign: "center",
    transition: "all 0.2s ease-in-out",
  };

  const blockTypeStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: "bold",
    color: "#aaa",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const nameStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    wordWrap: "break-word",
  };

  const subSystemButtonStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "-0.5rem",
    right: "50%",
    transform: "translateY(-50%) translateY(100%)",
    color: "#eee",
    padding: "6px 12px",
    borderRadius: 6,
    fontSize: 12,
    zIndex: 9999,
    cursor: "pointer",
    backdropFilter: "blur(0.2rem)",
    background: "rgba(255, 127,0,0.2)",
    border: "1px solid rgba(255,255,255,0.1)",
    transition: "background 0.3s",
  };

  const subSystemButtonHoverStyle: React.CSSProperties = {
    background: "#f90",
  };

  // **Tooltip 内容**
  const tooltipContent = (
    <div>
      {Object.keys(attributes).length > 0 && (
        <>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>Attributes:</div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {Object.entries(attributes).map(([k, v]) => (
              <li key={k} style={{ fontSize: 12, lineHeight: "16px" }}>
                {k}: {v}
              </li>
            ))}
          </ul>
        </>
      )}
      {portProps.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>
            Port Properties:
          </div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {portProps.map((pp, i) => (
              <li key={i} style={{ fontSize: 12, lineHeight: "16px" }}>
                {pp.type} port #{pp.index}
                {Object.entries(pp.props).map(([propName, propVal]) => (
                  <div key={propName}>
                    {propName}: {propVal}
                  </div>
                ))}
              </li>
            ))}
          </ul>
        </div>
      )}
      {Object.keys(attributes).length === 0 && portProps.length === 0 && (
        <div style={{ fontSize: 12 }}>No extra info</div>
      )}
    </div>
  );

  return (
    <>
      <NodeResizer minWidth={100} minHeight={40} />
      {inHandles}
      <div
        ref={nodeRef}
        style={nodeStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* BlockType (小字) */}
        <div style={blockTypeStyle}>{blockType}</div>

        {/* Name (大字) */}
        <div style={nameStyle}>{name}</div>

        {/* SubSystem 入口按钮 */}
        {isSubSystem && (
          <button
            style={subSystemButtonStyle}
            onClick={handleSubSystemClick}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                subSystemButtonHoverStyle.background as string)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                subSystemButtonStyle.background as string)
            }
          >
            Entry
          </button>
        )}
      </div>
      {outHandles}
      {/* Tooltip 使用 PortalTooltip 避免被裁剪 */}
      <PortalTooltip
        show={hovered}
        x={tooltipPos.x}
        y={tooltipPos.y}
        content={tooltipContent}
      />
    </>
  );
});
