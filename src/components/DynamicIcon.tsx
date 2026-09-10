import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";

export function DynamicIcon({ name, ...rest }: { name: string } & LucideProps) {
  const Cmp = (Icons as unknown as Record<string, React.FC<LucideProps>>)[name] ?? Icons.Circle;
  return <Cmp {...rest} />;
}
