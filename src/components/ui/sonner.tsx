import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-emerald-500 group-[.toaster]:text-white group-[.toaster]:border-emerald-600/40 group-[.toaster]:shadow-lg data-[type=error]:!bg-red-600 data-[type=error]:!border-red-700/40",
          description: "group-[.toast]:text-white/95",
          actionButton: "group-[.toast]:bg-white/15 group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-white/15 group-[.toast]:text-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
