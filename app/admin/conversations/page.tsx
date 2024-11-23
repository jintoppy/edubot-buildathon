"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";

const AdminConversationsPage = () => {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Students Conversations"
        text="View all conversations"
      />
    </DashboardShell>
  );
};

export default AdminConversationsPage;
