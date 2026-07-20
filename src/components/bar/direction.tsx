import { cn } from "../../lib/utils";
import { useProviders } from "../../lib/providers-context";

function Direction() {
  const { glazewm } = useProviders();

  const isVertical = () => glazewm()?.tilingDirection === "vertical";

  const handleClick = () => {
    if (glazewm()?.tilingDirection) {
      glazewm()?.runCommand("toggle-tiling-direction");
    }
  };

  return (
    <button
      class={cn(
        "h-8 w-8 flex items-center justify-center text-[var(--icon)] bg-[var(--icon)]/10 rounded-full p-1 transition-all duration-300 select-none",
        {
          "rotate-90": isVertical(),
          "cursor-pointer": Boolean(glazewm()?.tilingDirection),
        }
      )}
      onClick={handleClick}
      title={
        glazewm()?.tilingDirection
          ? `Toggle Tiling Direction (${glazewm()?.tilingDirection})`
          : "Zebar Nord"
      }
    >
      <i class="nf nf-md-lighthouse text-lg"></i>
    </button>
  );
}

export default Direction;
