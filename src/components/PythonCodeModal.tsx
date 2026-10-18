import React, { useState } from "react";
import { X, Copy, Check, Terminal, FileCode, Layers } from "lucide-react";

interface PythonCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTicker: string;
}

export const PythonCodeModal: React.FC<PythonCodeModalProps> = ({
  isOpen,
  onClose,
  activeTicker,
}) => {
  const [activeTab, setActiveTab] = useState<"streamlit" | "cli">("streamlit");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const streamlitScript = `import os
import json
import streamlit as st
import pandas as pd
import numpy as np
import yfinance as yf
from google import genai
from google.genai import types

# Set page config
st.set_page_config(
    page_title="Income ETF Screener & Portfolio Engine",
    page_icon="📈",
    layout="wide"
)

# Initialize Gemini Client
@st.cache_resource
def get_gemini_client(api_key: str):
    return genai.Client(api_key=api_key)

# Fetch Market & NAV Trend Data
@st.cache_data(ttl=3600)
def fetch_fund_data(ticker: str) -> dict:
    stock = yf.Ticker(ticker)
    hist = stock.history(period="1y")
    info = stock.info
    
    if hist.empty:
        return {}
        
    current_price = hist['Close'].iloc[-1]
    price_3m = hist['Close'].iloc[-63] if len(hist) >= 63 else hist['Close'].iloc[0]
    price_6m = hist['Close'].iloc[-126] if len(hist) >= 126 else hist['Close'].iloc[0]
    price_12m = hist['Close'].iloc[0]
    
    dividend_yield = info.get("yield", 0) or info.get("dividendYield", 0) or 0
    
    return {
        "ticker": ticker.upper(),
        "name": info.get("shortName", ticker),
        "current_price": round(current_price, 2),
        "yield_pct": round(dividend_yield * 100, 2),
        "nav_3m_pct": round(((current_price - price_3m) / price_3m) * 100, 2),
        "nav_6m_pct": round(((current_price - price_6m) / price_6m) * 100, 2),
        "nav_12m_pct": round(((current_price - price_12m) / price_12m) * 100, 2),
    }

# Analyze ROC and Assign Flags via Gemini
def audit_fund_with_ai(client, fund_data: dict) -> dict:
    prompt = f"""
    Analyze the following market and NAV performance data for the income ETF {fund_data['ticker']}:
    {json.dumps(fund_data, indent=2)}
    
    Determine if the fund suffers from destructive Return of Capital (ROC) or NAV erosion.
    Assign an alert status:
    - GREEN: Healthy NAV trend (>= -1.5%) and sustainable payout.
    - YELLOW: Mild NAV erosion (-1.5% to -3.0%), payout cut watch.
    - RED: Severe NAV erosion (< -3.0%), high risk of destructive ROC.
    """
    
    system_instruction = """
    You are an expert income ETF analyst evaluating Return of Capital (ROC) risk.
    Return output strictly in valid JSON with these keys:
    {
        "ticker": "STRING",
        "alert_status": "GREEN" | "YELLOW" | "RED",
        "is_destructive_roc": BOOLEAN,
        "risk_summary": "STRING (max 2 sentences)",
        "replacement_candidate": "STRING (ticker symbol)"
    }
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-3.8-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                system_instruction=system_instruction
            )
        )
        return json.loads(response.text)
    except Exception as e:
        nav_6m = fund_data.get("nav_6m_pct", 0)
        status = "GREEN" if nav_6m >= -1.5 else ("YELLOW" if nav_6m >= -3.0 else "RED")
        return {
            "ticker": fund_data["ticker"],
            "alert_status": status,
            "is_destructive_roc": nav_6m < -3.0,
            "risk_summary": f"Fallback rule evaluation based on 6M NAV trend ({nav_6m}%).",
            "replacement_candidate": "JEPI" if status == "RED" else ""
        }

# Portfolio Weighting Engine
def calculate_portfolio_weights(df: pd.DataFrame, strategy: str, target_yield: float, max_single_cap: float):
    active_df = df[df["alert_status"] != "RED"].copy()
    if active_df.empty:
        return df, "All funds in watchlist are flagged RED. Unable to build portfolio."
    
    n = len(active_df)
    message = "Portfolio successfully optimized."
    
    if strategy == "Equal Weighted":
        active_df["Weight (%)"] = round(100.0 / n, 2)
        
    elif strategy == "Vol / Risk-Capped":
        weights = []
        for _, row in active_df.iterrows():
            if "Single Stock" in row.get("Category", "") or row["yield_pct"] > 15.0:
                weights.append(min(max_single_cap, 100.0 / n))
            else:
                weights.append(100.0 / n)
        total_w = sum(weights)
        active_df["Weight (%)"] = [round((w / total_w) * 100, 2) for w in weights]
        
    elif strategy == "Target Yield Solver":
        max_possible_yield = active_df["yield_pct"].max()
        if target_yield > max_possible_yield:
            message = f"Target yield of {target_yield}% exceeds maximum available yield ({max_possible_yield}%). Set to maximum."
            target_yield = max_possible_yield
            
        yields = active_df["yield_pct"].values
        raw_weights = yields / yields.sum()
        active_df["Weight (%)"] = [round(w * 100, 2) for w in raw_weights]

    df = df.merge(active_df[["ticker", "Weight (%)"]], on="ticker", how="left")
    df["Weight (%)"] = df["Weight (%)"].fillna(0.0)
    
    return df, message

# Streamlit UI Setup
st.title("🛡️ Income ETF Screener & Portfolio Engine")
st.sidebar.header("1. Portfolio Settings")
strategy = st.sidebar.selectbox("Weighting Strategy", ["Equal Weighted", "Vol / Risk-Capped", "Target Yield Solver"])
target_yield = st.sidebar.slider("Target Portfolio Yield (%)", 4.0, 15.0, 8.0, 0.5)
max_single_cap = st.sidebar.slider("Max Single-Asset Cap (%)", 5.0, 30.0, 10.0, 2.5)

default_tickers = "JEPI, JEPQ, XYLD, NVDY, O, GPIX"
user_tickers = st.sidebar.text_area("Enter Tickers", value=default_tickers)
`;

  const cliScript = `import os
import json
import yfinance as yf
from google import genai
from google.genai import types

# Initialize Gemini Client using official Google GenAI SDK
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def get_market_context(ticker: str) -> dict:
    stock = yf.Ticker(ticker)
    hist = stock.history(period="1y")
    info = stock.info
    if hist.empty:
        return {}
    current_price = hist['Close'].iloc[-1]
    price_3m = hist['Close'].iloc[-63] if len(hist) >= 63 else hist['Close'].iloc[0]
    price_6m = hist['Close'].iloc[-126] if len(hist) >= 126 else hist['Close'].iloc[0]
    price_12m = hist['Close'].iloc[0]
    return {
        "ticker": ticker,
        "name": info.get("shortName", ticker),
        "current_price": round(float(current_price), 2),
        "nav_3m_change_pct": round(((current_price - price_3m) / price_3m) * 100, 2),
        "nav_6m_change_pct": round(((current_price - price_6m) / price_6m) * 100, 2),
        "nav_12m_change_pct": round(((current_price - price_12m) / price_12m) * 100, 2),
        "yield_pct": round((info.get("yield", 0) or 0) * 100, 2)
    }

def analyze_fund_with_gemini(ticker: str):
    data = get_market_context(ticker)
    response = client.models.generate_content(
        model='gemini-3.8-flash',
        contents=f"Analyze market data for {ticker}:\\n{json.dumps(data, indent=2)}",
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            system_instruction="You are an expert income ETF analyst evaluating Return of Capital (ROC) risk."
        ),
    )
    return json.loads(response.text)

if __name__ == "__main__":
    ticker_to_eval = "${activeTicker}"
    analysis = analyze_fund_with_gemini(ticker_to_eval)
    print(json.dumps(analysis, indent=2))
`;

  const activeScript = activeTab === "streamlit" ? streamlitScript : cliScript;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-sky-950/80 border border-sky-800 rounded text-sky-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Python Scripts &amp; Streamlit Engine
              </h3>
              <p className="text-[11px] text-slate-400">
                Official Google GenAI SDK (`@google/genai`) and Streamlit scripts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded border border-slate-800 text-xs mr-2">
              <button
                onClick={() => setActiveTab("streamlit")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === "streamlit"
                    ? "bg-slate-800 text-white font-medium"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Streamlit App
              </button>
              <button
                onClick={() => setActiveTab("cli")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === "cli"
                    ? "bg-slate-800 text-white font-medium"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                CLI Script
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 flex-1 overflow-auto bg-[#070b14] font-mono text-xs">
          <pre className="text-sky-300/90 leading-relaxed">
            <code>{activeScript}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0d1424] flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Dependencies: <code className="text-sky-400 font-mono">pip install streamlit google-genai yfinance pandas numpy</code>
          </div>
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-sky-400 hover:bg-sky-300 rounded transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied Code</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Script</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
