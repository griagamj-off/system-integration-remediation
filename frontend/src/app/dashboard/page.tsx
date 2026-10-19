"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_BASE, getAuthToken } from "@/lib/api";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  two_factor_confirmed?: boolean;
};

type DashboardData = {
  user: UserProfile;
  map: { provider: string; center: { lat: number; lng: number }; label: string };
  weather: { location: string; temperature_c: number; condition: string; icon: string; source: string };
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mfaSetup, setMfaSetup] = useState<{ secret: string; qr_code_url: string; message: string } | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaMessage, setMfaMessage] = useState("");
  const [weather, setWeather] = useState<{
    temperature: number;
    condition: string;
    location: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      router.push("/");
      return;
    }

    const fetchAccount = async () => {
      try {
        const [userResponse, dashboardResponse] = await Promise.all([
          fetch(`${API_BASE}/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch(`${API_BASE}/dashboard`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

        if (!userResponse.ok || !dashboardResponse.ok) {
          throw new Error("Your session has expired. Please log in again.");
        }

        const userData = await userResponse.json();
        const dashboardData = await dashboardResponse.json();

        setUser(userData.user);
        setDashboard(dashboardData);

        const weatherKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

        if (weatherKey) {
          const weatherApi = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=Manila&units=metric&appid=${weatherKey}`,
          );

          if (weatherApi.ok) {
            const data = await weatherApi.json();
            setWeather({
              temperature: Math.round(data.main.temp),
              condition: data.weather?.[0]?.main || "Clear",
              location: data.name || "Metro Manila",
            });
          } else {
            setWeather({
              temperature: 29,
              condition: "Partly cloudy",
              location: "Metro Manila",
              error: "Weather API key is invalid or the request failed.",
            });
          }
        } else {
          setWeather({
            temperature: 29,
            condition: "Partly cloudy",
            location: "Metro Manila",
          });
        }
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : "Unable to load the account.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [router]);

  const handleLogout = async () => {
    const token = getAuthToken();

    if (!token) {
      router.push("/");
      return;
    }

    await fetch(`${API_BASE}/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (typeof window !== "undefined") {
      window.localStorage.removeItem("access_token");
    }

    router.push("/");
  };

  const handleSetupMfa = async () => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE}/mfa/setup`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      setMfaMessage(data.message || "MFA setup failed.");
      return;
    }

    setMfaSetup(data);
    setMfaMessage(data.message);
  };

  const handleVerifyMfa = async () => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE}/mfa/verify`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: mfaCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMfaMessage(data.message || "Invalid MFA code.");
      return;
    }

    setMfaMessage(data.message);
    setUser((current) => (current ? { ...current, two_factor_confirmed: true } : current));
    setMfaCode("");
    setMfaSetup(null);
  };

  if (loading) {
    return <main className="auth-shell"><section className="auth-card centered"><h2>Loading dashboard...</h2></section></main>;
  }

  if (error) {
    return (
      <main className="auth-shell">
        <section className="auth-card centered">
          <h2>Access denied</h2>
          <p className="status error">{error}</p>
          <div className="auth-links">
            <Link href="/">Return to login</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <div className="dashboard-topbar">
        <div>
          <span className="eyebrow">Protected area</span>
          <h2>Welcome, {user?.name}</h2>
        </div>
        <button className="danger-button" onClick={handleLogout}>Log out</button>
      </div>

      <div className="dashboard-grid">
        <section className="section-panel">
          <h3>User profile</h3>
          <div className="metric">
            <span>Name</span>
            <strong>{user?.name}</strong>
          </div>
          <div className="metric">
            <span>Email</span>
            <strong>{user?.email}</strong>
          </div>
          <div className="metric">
            <span>MFA</span>
            <strong>{user?.two_factor_confirmed ? "Enabled" : "Not enabled"}</strong>
          </div>
        </section>

        <section className="section-panel">
          <h3>Weather</h3>
          <div className="weather-box">
            {weather ? (
              <>
                <div className="weather-info">
                  <div>
                    <div className="small-muted">{weather.location}</div>
                    <div className="weather-temp">{weather.temperature}°C</div>
                  </div>
                  <div className="small-muted">{weather.condition}</div>
                </div>
                {weather.error ? <p className="status error">{weather.error}</p> : null}
              </>
            ) : (
              <p>Loading weather...</p>
            )}
          </div>
        </section>

        <section className="section-panel">
          <h3>Map location</h3>
          <div className="map-box">
            {dashboard?.map ? (
              <iframe
                title="Map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=120.9148%2C14.5223%2C121.1341%2C14.6990&amp;layer=mapnik"
              />
            ) : (
              <p>Loading map...</p>
            )}
          </div>
        </section>

        <section className="section-panel mfa-card">
          <h3>Multi-factor authentication</h3>
          {user?.two_factor_confirmed ? (
            <p className="status success">MFA is already active for this account.</p>
          ) : (
            <>
              <button className="secondary-button" onClick={handleSetupMfa}>Set up MFA</button>
              {mfaSetup ? (
                <>
                  <div className="mfa-qr">
                    <img src={mfaSetup.qr_code_url} alt="OTP QR code" />
                  </div>
                  <div className="field-group">
                    <label>
                      Verification code
                      <input
                        type="text"
                        maxLength={6}
                        value={mfaCode}
                        onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                      />
                    </label>
                    <button className="inline-button" onClick={handleVerifyMfa}>Verify MFA</button>
                    <div className="small-muted">Secret: {mfaSetup.secret}</div>
                  </div>
                </>
              ) : null}
            </>
          )}
          {mfaMessage ? <p className="status success">{mfaMessage}</p> : null}
        </section>
      </div>
    </main>
  );
}
