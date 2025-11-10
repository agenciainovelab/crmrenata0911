import Image from "next/image";

export function Logo() {
  return (
    <div className="relative h-12 w-full max-w-[200px]">
      <Image
        src="/images/logo/logo-politico.png"
        fill
        className="object-contain object-left"
        alt="Renata Daguiar - Sistema Político"
        role="presentation"
        quality={100}
      />
    </div>
  );
}
