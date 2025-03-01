"use client";

import React, { useEffect, useState } from "react";
import "@xyflow/react/dist/style.css";
import { useParams, useRouter } from "next/navigation";
import FlowCanvas from "../../../components/FlowCanvas";
import { useSimulinkParsed } from "../../../lib/slx-json.hook";

export default function SubsystemViewPage() {
  const router = useRouter();
  const params = useParams() as { sid: string };
  const { data, loading } = useSimulinkParsed();
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  useEffect(() => {
    const subData = data?.subsystems?.[+params.sid];
    if (subData) {
      setNodes(subData.nodes);
      setEdges(subData.edges);
    }
    if (!loading && !subData) {
      router.push("/view");
      return;
    }
  }, [router, data, loading, params.sid]);

  return <FlowCanvas nodes={nodes} edges={edges} sid={params.sid} />;
}
