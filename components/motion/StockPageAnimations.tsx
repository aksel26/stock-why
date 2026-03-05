"use client";

import { type ReactNode } from "react";
import { StaggerContainer, StaggerItem } from "./index";

interface AnimatedCardGridProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedCardGrid({ children, className }: AnimatedCardGridProps) {
  return (
    <StaggerContainer stagger={0.1} className={className}>
      {children}
    </StaggerContainer>
  );
}

export function AnimatedCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <StaggerItem className={className}>
      {children}
    </StaggerItem>
  );
}
