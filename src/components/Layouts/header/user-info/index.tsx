"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LogOutIcon, UserIcon } from "./icons";

interface UserData {
  name: string;
  email: string;
  img: string;
}

export function UserInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const [user, setUser] = useState<UserData>({
    name: "Usuário",
    email: "",
    img: "",
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await fetch(`/api/usuarios/${userId}`);
      if (!response.ok) return;

      const userData = await response.json();
      setUser({
        name: userData.nome,
        email: userData.email,
        img: userData.foto || "",
      });
      setImgError(false);
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    router.push("/auth/sign-in");
  };

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="rounded align-middle outline-none ring-primary ring-offset-2 focus-visible:ring-1 dark:ring-offset-gray-dark">
        <span className="sr-only">Minha Conta</span>

        <figure className="flex items-center gap-3 cursor-pointer">
          {user.img && !imgError ? (
            <Image
              src={user.img}
              className="size-12 rounded-full object-cover"
              alt={`Avatar de ${user.name}`}
              role="presentation"
              width={200}
              height={200}
              onError={() => setImgError(true)}
              unoptimized
            />
          ) : (
            <div className="size-12 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
              </span>
            </div>
          )}
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark min-[230px]:min-w-[17.5rem]"
        align="end"
      >
        <h2 className="sr-only">Informações do Usuário</h2>

        <figure className="flex items-center gap-2.5 px-5 py-3.5">
          {user.img && !imgError ? (
            <Image
              src={user.img}
              className="size-12 rounded-full object-cover"
              alt={`Avatar de ${user.name}`}
              role="presentation"
              width={200}
              height={200}
              onError={() => setImgError(true)}
              unoptimized
            />
          ) : (
            <div className="size-12 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
              </span>
            </div>
          )}

          <figcaption className="space-y-1 text-base font-medium">
            <div className="mb-2 leading-none text-dark dark:text-white">
              {user.name}
            </div>

            <div className="leading-none text-gray-6">{user.email}</div>
          </figcaption>
        </figure>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6 [&>*]:cursor-pointer">
          <Link
            href={"/dashboard/perfil"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <UserIcon />

            <span className="mr-auto text-base font-medium">Meu Perfil</span>
          </Link>
        </div>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6">
          <button
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
          >
            <LogOutIcon />

            <span className="text-base font-medium">Sair</span>
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}
