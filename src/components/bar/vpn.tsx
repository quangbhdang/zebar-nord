import { cn } from "../../lib/utils";
import { createSignal, createEffect, onCleanup, Show } from "solid-js";
import { shellExec } from "zebar";
import { useProviders } from "../../lib/providers-context";

interface VpnStatus {
  connected: boolean;
  tailscale: boolean;
  vpn: boolean;
  name: string;
}

function Vpn() {
  const { network } = useProviders();
  const [status, setStatus] = createSignal<VpnStatus>({
    connected: false,
    tailscale: false,
    vpn: false,
    name: "",
  });

  const checkVpn = async () => {
    try {
      // Running 'ipconfig.exe' is extremely fast (<10ms) and uses almost zero CPU
      // compared to starting a heavy PowerShell instance.
      const result = await shellExec("ipconfig.exe");

      if (result && result.stdout) {
        const sections = result.stdout.split(/\r?\n\r?\n/);
        let tailscale = false;
        let vpn = false;
        let name = "";

        for (const section of sections) {
          const lines = section.split(/\r?\n/);
          if (lines.length === 0) continue;

          // Match adapter headers: e.g. "Ethernet adapter Tailscale:" or "PPP adapter WorkVPN:"
          const headerMatch = lines[0].match(
            /^(?:Ethernet adapter|Wireless LAN adapter|Tunnel adapter|PPP adapter)\s+(.*?):$/i
          );
          if (!headerMatch) continue;

          const adapterName = headerMatch[1].trim();

          const isTailscale = /Tailscale/i.test(adapterName);
          const isVpnKeyword =
            /VPN|TAP|TUN|WireGuard|Cisco|GlobalProtect|Fortinet|AnyConnect/i.test(
              adapterName
            );

          if (isTailscale || isVpnKeyword) {
            let hasIp = false;
            let isDisconnected = false;

            for (const line of lines) {
              if (/Media State/i.test(line) && /disconnected/i.test(line)) {
                isDisconnected = true;
              }
              if (/IPv4 Address/i.test(line)) {
                // Filter out self-assigned APIPA addresses (169.254.x.x)
                if (!/: 169\.254\./.test(line)) {
                  hasIp = true;
                }
              }
            }

            if (hasIp && !isDisconnected) {
              if (isTailscale) {
                tailscale = true;
                if (!name) name = "Tailscale";
              } else {
                vpn = true;
                if (!name || name === "Tailscale") name = adapterName;
              }
            }
          }
        }

        setStatus({
          connected: tailscale || vpn,
          tailscale,
          vpn,
          name,
        });
      }
    } catch (err) {
      console.warn("VPN status check failed:", err);
    }
  };

  createEffect(() => {
    // React to any network state changes from the Zebar network provider
    network();
    checkVpn();
  });

  createEffect(() => {
    // Backup poll every 30 seconds for state changes not captured by the network provider
    const interval = setInterval(checkVpn, 30000);
    onCleanup(() => clearInterval(interval));
  });

  return (
    <Show when={status().connected}>
      <div
        class={cn(
          "h-8 flex items-center transition-all duration-300 justify-center overflow-hidden gap-2 text-[var(--vpn)] bg-[var(--vpn)]/10 rounded-full px-3 relative cursor-pointer"
        )}
        title={status().name || (status().tailscale ? "Tailscale Connected" : "VPN Connected")}
      >
        <Show
          when={status().tailscale}
          fallback={<i class="ti ti-shield-lock text-lg"></i>}
        >
          <i class="ti ti-shield-check text-lg"></i>
        </Show>
        <span class="text-sm font-semibold">
          {status().name || (status().tailscale ? "Tailscale" : "VPN")}
        </span>
      </div>
    </Show>
  );
}

export default Vpn;
