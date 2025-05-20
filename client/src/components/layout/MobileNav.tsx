import { useLocation } from "wouter";
import { Link } from "wouter";

interface MobileNavProps {
  navItems: {
    href: string;
    label: string;
  }[];
}

export default function MobileNav({ navItems }: MobileNavProps) {
  const [location] = useLocation();
  
  return (
    <div className="md:hidden overflow-x-auto scrollbar-hide border-t border-neutral-200">
      <div className="flex space-x-6 px-4 py-2 whitespace-nowrap">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a className={`font-medium ${
              location === item.href 
                ? "text-primary border-b-2 border-primary" 
                : "text-neutral-600 hover:text-primary"
            }`}>
              {item.label}
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
