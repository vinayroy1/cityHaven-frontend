"use client";

import React from "react";
import { FlatmateContactModal } from "./FlatmateContactModal";
import type { FlatmateListing } from "@/types/flatmate.types";

interface FlatmateInterestModalProps {
  listing: FlatmateListing | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FlatmateInterestModal(props: FlatmateInterestModalProps) {
  return <FlatmateContactModal {...props} />;
}

