import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function IndexPage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate(createPageUrl("Dashboard"));
  }, [navigate]);
  
  return null;
}