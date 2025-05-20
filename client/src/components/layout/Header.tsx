import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Bell, User } from "lucide-react";
import MobileNav from "./MobileNav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const [location] = useLocation();
  const { toast } = useToast();
  const { data: user } = useQuery({
    queryKey: ['/api/user/1'],
  });

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/expenses", label: "Ausgaben" },
    { href: "/budgets", label: "Budgets" },
    { href: "/savings", label: "Sparziele" },
    { href: "/contracts", label: "Verträge" },
    { href: "/schufa", label: "SCHUFA" },
    { href: "/crypto", label: "Krypto" }
  ];

  const handleNotificationClick = () => {
    toast({
      title: "Keine Benachrichtigungen",
      description: "Sie haben derzeit keine ungelesenen Benachrichtigungen."
    });
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <a className="text-primary font-heading font-bold text-2xl">BudgetSmart</a>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a className={`text-neutral-600 hover:text-primary font-medium ${
                location === item.href ? "text-primary" : ""
              }`}>
                {item.label}
              </a>
            </Link>
          ))}
        </div>
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-2 rounded-full hover:bg-neutral-100"
            onClick={handleNotificationClick}
          >
            <Bell className="h-6 w-6 text-neutral-600" />
          </Button>
          
          <Button variant="ghost" size="icon" className="ml-2 p-1 rounded-full border-2 border-primary-light overflow-hidden">
            <Avatar>
              <AvatarImage 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                alt={user?.firstName || "Benutzer"} 
              />
              <AvatarFallback className="bg-primary text-white">
                {user?.firstName?.charAt(0) || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>
      
      <MobileNav navItems={navItems} />
    </header>
  );
}
