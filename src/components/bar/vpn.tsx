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
    // 1. Try native Zebar network provider interfaces (in-memory, 0ms latency, zero CPU)
    const net = network();
    if (net && net.interfaces && net.interfaces.length > 0) {
      let tailscale = false;
      let vpn = false;
      let name = "";

      for (const iface of net.interfaces) {
        const label = `${iface.name || ""} ${iface.friendlyName || ""} ${iface.description || ""}`;

        const isTailscale = /Tailscale/i.test(label);
        const isVpnKeyword =
          /VPN|TAP|TUN|WireGuard|Cisco|GlobalProtect|Fortinet|AnyConnect|OpenVPN/i.test(
            label
          );

        if (isTailscale || isVpnKeyword) {
          const validIps = (iface.ipv4Addresses || []).filter(
            (ip) => ip && !ip.startsWith("169.254.") && ip !== "0.0.0.0"
          );

          if (validIps.length > 0) {
            if (isTailscale) {
              tailscale = true;
              if (!name) name = "Tailscale";
            } else {
              vpn = true;
              if (!name || name === "Tailscale") {
                name = iface.friendlyName || iface.name || "VPN";
              }
            }
          }
        }
      }

      if (tailscale || vpn) {
        setStatus({
          connected: true,
          tailscale,
          vpn,
          name,
        });
        return;
      }
    }

    // 2. Fallback check using ipconfig.exe if provider array was empty or didn't match
    try {
      const result = await shellExec("ipconfig.exe");
      if (result && result.stdout) {
        const sections = result.stdout.split(/\r?\n\r?\n/);
        let tailscale = false;
        let vpn = false;
        let name = "";

        for (const section of sections) {
          const lines = section.split(/\r?\n/);
          if (lines.length === 0) continue;

          const headerMatch = lines[0].match(
            /^(?:Ethernet adapter|Wireless LAN adapter|Tunnel adapter|PPP adapter|Carte|Adaptador|以太网适配器)\s+(.*?):$/i
          );

          const adapterName = headerMatch ? headerMatch[1].trim() : lines[0];

          const isTailscale = /Tailscale/i.test(section) || /Tailscale/i.test(adapterName);
          const isVpnKeyword =
            /VPN|TAP|TUN|WireGuard|Cisco|GlobalProtect|Fortinet|AnyConnect|OpenVPN/i.test(
              section
            ) ||
            /VPN|TAP|TUN|WireGuard|Cisco|GlobalProtect|Fortinet|AnyConnect|OpenVPN/i.test(
              adapterName
            );

          if (isTailscale || isVpnKeyword) {
            let hasIp = false;
            let isDisconnected = false;

            for (const line of lines) {
              if (
                /Media State|Medienstatus|Statut du média|Estado de los medios/i.test(line) &&
                /disconnected|getrennt|déconnecté|desconectado/i.test(line)
              ) {
                isDisconnected = true;
              }
              if (/IPv4/i.test(line) && /:\s*\d+\.\d+\.\d+\.\d+/.test(line)) {
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
        return;
      }
    } catch (err) {
      console.warn("VPN status ipconfig fallback check failed:", err);
    }

    // If no VPN detected
    setStatus({
      connected: false,
      tailscale: false,
      vpn: false,
      name: "",
    });
  };

  createEffect(() => {
    // React to network updates from Zebar
    network();
    checkVpn();
  });

  createEffect(() => {
    // Fallback poll every 15 seconds
    const interval = setInterval(checkVpn, 15000);
    onCleanup(() => clearInterval(interval));
  });

  return (
    <Show when={status().connected}>
      <div
        class={cn(
          "h-8 flex items-center transition-all duration-300 justify-center overflow-hidden gap-2 text-[var(--vpn)] bg-[var(--vpn)]/10 rounded-full px-3 relative cursor-pointer"
        )}
        title={status().name || (status().tailscale ? "Tailscale Connected" : "VPN Connected")}
        onClick={checkVpn}
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
