import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  colorFrom: string;
  colorTo: string;
  icon: ReactNode;
  stats: ReactNode;
  buttonText: string;
  linkTo: string;
}

export default function FeatureCard({
  title,
  description,
  colorFrom,
  colorTo,
  icon,
  stats,
  buttonText,
  linkTo
}: FeatureCardProps) {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className={`h-32 bg-gradient-to-r ${colorFrom} ${colorTo} relative`}>
        <div className="absolute inset-0 opacity-20 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-heading font-semibold text-lg mb-2">{title}</h3>
        <p className="text-neutral-600 text-sm mb-4">{description}</p>
        
        {stats}
        
        <Link href={linkTo}>
          <Button className="w-full mt-4 py-2 text-center text-sm font-medium bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
            {buttonText}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
