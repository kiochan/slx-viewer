"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  EdgeChange,
  MiniMap,
  NodeChange,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "../constants/settings";
import { useRouter } from "next/navigation";

interface FlowCanvasProps {
  nodes: any[];
  edges: any[];
  sid?: string;
}

export default function FlowCanvas(props: FlowCanvasProps) {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    setNodes(props.nodes);
  }, [props.nodes]);

  useEffect(() => {
    setEdges(props.edges);
  }, [props.edges]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          backgroundColor: "#f8f9fa",
          borderBottom: "2px solid #ddd",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", color: "#333", fontWeight: 600 }}>
          {props.sid ? `Sub System: ${props.sid}` : "Root System"}
        </h2>

        <button
          style={{
            padding: "10px 16px",
            fontSize: "1rem",
            fontWeight: "bold",
            color: "#fff",
            backgroundColor: "#007BFF",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0, 123, 255, 0.3)",
            transition: "background 0.3s ease-in-out",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#0056b3")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#007BFF")
          }
          onClick={() => router.push(props.sid ? "/view" : "/")}
        >
          {props.sid ? "⬅ Back to Root" : "Back to Home"}
        </button>
      </div>

      {/* Main Flow Canvas */}
      <ReactFlowProvider>
        <div
          style={{
            width: "100%",
            height: "calc(100% - 60px)",
          }}
        >
          <ReactFlow
            nodeTypes={nodeTypes}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            style={{
              borderRadius: "8px",
              backgroundColor: "#fff",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Background variant={BackgroundVariant.Dots} gap={15} size={1} />
            <MiniMap
              style={{
                backgroundColor: "#f1f3f5",
                borderRadius: "6px",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Controls />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
}
