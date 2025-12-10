export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// app/(root)/page.tsx
import { headers, cookies } from "next/headers";
import Link from "next/link";

import HeaderBox from "@/components/HeaderBox";
import RightSidebar from "@/components/RightSidebar";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import RecentTransactions from "@/components/RecentTransactions";
import FinancialNews from "@/components/FinancialNews";
import { getLoggedInUser } from "@/lib/actions/user.actions";

type UiAccount = {
  accountId: string;
  name: string;
  subtype?: string | null;
  mask?: string | null;
  currentBalance: number;
  isoCurrencyCode?: string | null;
  institutionName?: string | null;
};

// Build absolute URL on the server
async function absUrl(path: string) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}${path}`;
}

async function getLinkedAccounts(): Promise<UiAccount[]> {
  const url = await absUrl("/api/plaid/accounts");
  const cookieHeader = (await cookies()).toString();

  const res = await fetch(url, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  }).catch(() => null);

  if (!res || !res.ok) return [];
  const json = await res.json().catch(() => null);
  if (!json?.ok) return [];

  return json.accounts as UiAccount[];
}

const Home = async () => {
  const loggedIn = await getLoggedInUser();
  const accounts = await getLinkedAccounts();

  const totalBanks = accounts.length;
  const totalCurrentBalance = accounts.reduce((sum, a) => {
    const n = Number(a.currentBalance ?? 0);
    return Number.isFinite(n) ? sum + n : sum;
  }, 0);

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || "Guest"}
            subtext="Access and manage your account and transactions efficiently"
          />

          {totalBanks === 0 ? (
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-700">
                No bank linked yet.{" "}
                <Link href="/link-bank" className="text-blue-600 underline">
                  Link a bank
                </Link>
                {" "}to see your balances and transactions.
              </p>
            </div>
          ) : (
            <TotalBalanceBox
              accounts={accounts as any}
              totalBanks={totalBanks}
              totalCurrentBalance={totalCurrentBalance}
            />
          )}
        </header>

        <section className="mt-8">
          <RecentTransactions />
        </section>

        <section className="mt-8">
          <FinancialNews />
        </section>
      </div>

      <RightSidebar
        user={loggedIn}
        transactions={[]}
        banks={accounts as any}
      />
    </section>
  );
};

export default Home;
