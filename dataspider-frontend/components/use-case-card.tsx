"use client";

import { FC } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface UseCaseCardProps {
  title: string;
  description: string;
  path: string;
  className?: string;
}

const UseCaseCard: FC<UseCaseCardProps> = ({
  title,
  description,
  path,
  className,
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="h-full"
  >
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="flex-1">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Link href={path} className="w-full">
          <Button className="w-full bg-primary hover:bg-primary/90">
            Try it out
          </Button>
        </Link>
      </CardContent>
    </Card>
  </motion.div>
);

export default UseCaseCard;
