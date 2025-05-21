import { Link } from "wouter";

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-neutral-200 py-6 mt-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="text-primary font-heading font-bold text-xl">BudgetSmart</div>
            <div className="text-sm text-neutral-500 mt-1">Ihre Finanz-Schaltzentrale</div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <Link href="#">
              <a className="text-sm text-neutral-600 hover:text-primary">Datenschutz</a>
            </Link>
            <Link href="#">
              <a className="text-sm text-neutral-600 hover:text-primary">AGB</a>
            </Link>
            <Link href="#">
              <a className="text-sm text-neutral-600 hover:text-primary">Impressum</a>
            </Link>
            <Link href="#">
              <a className="text-sm text-neutral-600 hover:text-primary">Kontakt</a>
            </Link>
            <Link href="#">
              <a className="text-sm text-neutral-600 hover:text-primary">Hilfe</a>
            </Link>
          </div>
        </div>
        <div className="text-center text-xs text-neutral-500 mt-6">
          © {year} BudgetSmart GmbH. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
}
