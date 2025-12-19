import Image from "next/image";

interface AuthBrandPanelProps {
  heading: string;
  description: string;
}

export default function AuthBrandPanel({
  heading,
  description,
}: AuthBrandPanelProps) {
  return (
    <div className="hidden lg:flex lg:w-[45%] items-center justify-center p-12 relative overflow-hidden">
      {/* Background Image */}
      <Image
        src="/bg-darkest-medium@2x.webp"
        alt="Background"
        fill
        priority
        className="object-cover saturate-100"
        quality={90}
      />

      {/* Content */}
      <div className="relative z-10 max-w-lg">
        <Image
          src="/icons-assets/logo-compact-white.svg"
          alt="SiteSage"
          width={150}
          height={50}
          priority
          className="mb-12"
        />
        <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
          {heading}
        </h1>
        <p className="text-xl text-neutral-400">{description}</p>
      </div>
    </div>
  );
}
