"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function TabCloseHandler() {
  useEffect(() => {
    // Get or create unique tab ID (persists across navigation within same tab)
    let tabId = sessionStorage.getItem("tabId");
    if (!tabId) {
      tabId = `tab_${Date.now()}_${Math.random()}`;
      sessionStorage.setItem("tabId", tabId);
    }

    // Update this tab's heartbeat
    const updateHeartbeat = () => {
      const tabs = JSON.parse(localStorage.getItem("activeTabs") || "{}");
      tabs[tabId] = Date.now();
      localStorage.setItem("activeTabs", JSON.stringify(tabs));
    };

    // Clean up dead tabs and check if we should sign out
    const cleanupDeadTabs = () => {
      const tabs = JSON.parse(localStorage.getItem("activeTabs") || "{}");
      const now = Date.now();
      const staleThreshold = 3500; // 3.5 seconds (slightly more than heartbeat interval)
      
      // Remove tabs that haven't sent heartbeat recently
      let hasActiveTabs = false;
      Object.keys(tabs).forEach((id) => {
        if (now - tabs[id] > staleThreshold) {
          delete tabs[id];
        } else {
          hasActiveTabs = true;
        }
      });

      if (!hasActiveTabs && Object.keys(tabs).length === 0) {
        // No active tabs - sign out
        const supabase = createSupabaseBrowserClient();
        supabase.auth.signOut();
        localStorage.removeItem("activeTabs");
      } else {
        localStorage.setItem("activeTabs", JSON.stringify(tabs));
      }
    };

    // Initial heartbeat
    updateHeartbeat();
    
    // Send heartbeat every 1.5 seconds
    const heartbeatInterval = setInterval(updateHeartbeat, 1500);
    
    // Check for dead tabs every 2 seconds
    const cleanupInterval = setInterval(cleanupDeadTabs, 2000);

    // Cleanup on unmount
    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(cleanupInterval);
    };
  }, []);

  return null;
}
