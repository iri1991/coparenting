import Link from "next/link";
import Image from "next/image";

interface AppLogoProps {
  /** Dimensiune în px (latura pătratului). */
  size?: number;
  /** Dacă e true, logo-ul e un link către /. */
  linkToHome?: boolean;
  className?: string;
}

const DEFAULT_SIZE = 36;

export function AppLogo({ size = DEFAULT_SIZE, linkToHome = false, className = "" }: AppLogoProps) {
  const img = (
    <Image
      src="/logo.png"
      alt="HomeSplit"
      width={size}
      height={size}
      className={`object-contain ${className}`.trim()}
      priority
    />
  );

  if (linkToHome) {
    return (
      <Link
        href="/"
        className="flex items-center shrink-0 rounded-lg hover:opacity-90 transition-opacity"
        aria-label="HomeSplit – acasă"
      >
        {img}
      </Link>
    );
  }

  return img;
}
