"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FlowCanvas from "../../components/FlowCanvas";
import { useSimulinkParsed } from "../../lib/slx-json.hook";

export default function RootViewPage() {
  const router = useRouter();
  const { data, loading } = useSimulinkParsed();
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  useEffect(() => {
    const rootData = data?.root;
    if (rootData) {
      setNodes(rootData.nodes);
      setEdges(rootData.edges);
    }
    if (!loading && !rootData) {
      router.push("/");
      return;
    }
  }, [router, data, loading]);

  return loading ? null : <FlowCanvas nodes={nodes} edges={edges} />;
}
