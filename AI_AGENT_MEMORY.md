# AI Trading Bot - Agent Memory & Context

## Project Identity
- **Project:** AI Crypto Trading Bot for Core Calling LLC
- **Contract Value:** $10,000 USD
- **Timeline:** 4 weeks starting July 18, 2025
- **Current Date:** August 15, 2025
- **Status:** Phase 1 COMPLETE (50% of project done)

## Key Stakeholders
- **Client:** Damiano Duran (Core Calling LLC)
- **Developer:** Jay Kinney (Flip-Tech Inc)
- **Initial Capital:** $50,000 on Binance
- **Target Returns:** 3-5% weekly (100%+ annual)

## Critical Context for AI Agents

### Core Objective
Build an institutional-grade crypto trading bot that operates 24/7 on Binance with advanced AI decision-making, achieving consistent high returns while maintaining strict risk controls.

### Current State Summary
- **What Exists:** Basic React dashboard with simple trading logic
- **Critical Missing:** Binance integration, backend service, ML models, 24/7 automation
- **Biggest Risk:** Timeline - need 2-3 developers to complete in 4 weeks

### Trading Philosophy (Per Grok Discussion)
```
STRATEGIES ARE GUIDES, NOT RULES
- Never execute automatically on signals
- Always reason step-by-step before trading
- Cross-validate with 3-5 indicators minimum
- Consider overlooked factors (on-chain, funding rates, whale movements)
- Target risk-reward >2:1
- Self-optimize via reinforcement learning
```

## Technical Architecture

### **CRITICAL ARCHITECTURE DECISION**
⚠️ **THIS PROJECT USES REACT + VITE, NOT NEXT.JS** ⚠️
- **Frontend Framework:** React 18 with Vite (NOT Next.js)
- **Build Tool:** Vite 5.4.14
- **NEVER suggest or implement Next.js for this project**
- **All routing uses React Router, not Next.js routing**

### Current Stack (Phase 1 Complete)
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend Services:** 
  - Node.js/Express (main backend)
  - Python Flask (ML/backtesting service)
- **Database:** Supabase (PostgreSQL)
- **Trading:** Alpaca (implemented, Binance deferred to Phase 2)
- **AI Systems:**
  - Groq for sentiment analysis
  - AdaptiveThreshold pre-RL learning system (implemented)
  - Composer MCP for backtesting (integrated)
- **Market Data:** 6 free APIs integrated (pending API keys):
  - CoinGecko
  - CryptoCompare
  - Messari
  - CoinCap
  - CoinPaprika
  - Nomics

### Required Stack (Updated)
- **Backend:** ✅ Python/Node.js service (IMPLEMENTED)
- **Exchange:** Alpaca (current), Binance (Phase 2)
- **Database:** PostgreSQL (via Supabase) + Redis cache (Phase 2)
- **ML:** ✅ AdaptiveThreshold system (IMPLEMENTED)
- **Monitoring:** Custom dashboard (✅), Telegram (Phase 2)
- **Execution:** <100ms latency target

## Implementation Status

### Phase 1 (COMPLETE - 50% of project)
✅ Backend services (Node.js/Express + Python Flask)
✅ Microservices architecture implemented
✅ AdaptiveThreshold pre-RL learning system
✅ Composer MCP integration for backtesting
✅ 6 free API integrations (data sources)
✅ Risk management system
✅ React + Vite frontend (NOT Next.js)

### Phase 2 (Next Steps - 25% of project)
1. Complete API key configuration for data sources
2. Enhance ML model pipeline
3. Implement advanced trading strategies
4. Add real-time monitoring features

### Phase 3 (Final - 25% of project)
1. Binance integration (when client ready)
2. Production deployment
3. Performance optimization
4. Comprehensive testing
5. Documentation completion

## Risk Management Rules

### Capital Allocation
- 60% low-risk core strategies
- 30% medium-risk margin plays
- 10% high-risk opportunities

### Position Limits
- Max 5-10% per trade
- Max 15% portfolio drawdown
- Max 10% correlated assets (BTC/ETH)
- Leverage: 1-5x based on confidence

### Trade Validation
Require 3+ positive signals:
- MA20 > MA50 ✓
- RSI > 55 ✓
- MACD > 0 ✓
- Momentum > 0 ✓
- Confidence ≥ 0.7 ✓

## Performance Targets
- Execution: <100ms
- Uptime: 99.9%
- Sharpe Ratio: >1.5
- Win Rate: >60%
- Max Consecutive Losses: <5
- Weekly Return: 3-5%
- Annual Return: 100%+

## Key Files & Locations

### Core Services (Implemented)
- `/src/services/tradingAgent.ts` - Main trading logic
- `/src/services/riskManager.ts` - Risk controls  
- `/src/services/alpacaService.ts` - Trading execution (Alpaca for now)
- `/src/services/groqService.ts` - AI sentiment
- `/backend/server.js` - Node.js/Express backend
- `/backend/ml_service.py` - Python Flask ML service
- `/src/services/adaptiveThreshold.ts` - Pre-RL learning system

### Implemented Components
- ✅ `backend/server.js` - Main backend service
- ✅ `backend/ml_service.py` - ML/backtesting service
- ✅ `adaptiveThreshold.ts` - Learning system
- ✅ Composer MCP integration

### Deferred to Phase 2/3
- `binanceService.ts` - Deferred (using Alpaca for now)
- Advanced ML pipelines - Phase 2
- On-chain analytics - Phase 3

## Database Schema Updates Needed
```sql
-- Add tables for:
CREATE TABLE trading_signals (...)
CREATE TABLE ml_predictions (...)
CREATE TABLE backtest_results (...)
CREATE TABLE risk_metrics (...)
CREATE TABLE whale_alerts (...)
```

## API Integrations Required
1. **Binance** - Trading execution
2. **Kraken** - Backup exchange
3. **Glassnode** - On-chain analytics
4. **WhaleAlert** - Large transactions
5. **NewsAPI** - Sentiment analysis
6. **Telegram** - Notifications

## Testing Requirements
- Unit tests for all strategies
- Integration tests for APIs
- Backtest on 2+ years data
- Paper trade for 1 week
- Stress test with $5K real capital

## Deployment Checklist
- [ ] Backend service running 24/7
- [ ] Binance API connected
- [ ] ML models trained and deployed
- [ ] Risk controls verified
- [ ] Monitoring active
- [ ] Documentation complete
- [ ] Client trained on system

## Agent Instructions

### For Code Implementation
1. Always check risk limits before trades
2. Log all decisions for audit
3. Fail gracefully with fallbacks
4. Never expose API keys
5. Validate all external data

### For Testing
1. Test with paper trading first
2. Verify all risk controls
3. Simulate black swan events
4. Check performance metrics
5. Validate against SOW requirements

### For Documentation
1. Document all strategies
2. Explain risk parameters
3. Provide troubleshooting guide
4. Include API documentation
5. Create user manual

## Communication Protocols

### Daily Updates Should Include
- Progress against timeline
- Blockers or risks
- Performance metrics
- Capital at risk
- Next 24hr priorities

### Alert Triggers
- Drawdown > 10%
- Execution latency > 500ms
- API failures
- Unusual market conditions
- Risk limit breaches

## Success Criteria
1. ✅ Binance integration working
2. ✅ 24/7 automation active
3. ✅ <100ms execution
4. ✅ ML models deployed
5. ✅ Risk controls enforced
6. ✅ 3-5% weekly returns
7. ✅ Client satisfied

## Critical Notes for All Future Agents

### ⚠️ ARCHITECTURAL CONSTRAINTS ⚠️
1. **NEVER USE NEXT.JS** - This project uses React + Vite
2. **DO NOT suggest converting to Next.js**
3. **USE React Router for routing, not Next.js routing**
4. **BUILD with Vite, not Next.js build system**
5. **FRONTEND is React 18 + Vite 5.4.14**

### Project Status
- Phase 1: ✅ COMPLETE (50% done)
- Backend services: ✅ IMPLEMENTED
- ML system: ✅ AdaptiveThreshold working
- Backtesting: ✅ Composer MCP integrated
- Trading: Using Alpaca (Binance deferred)

### Development Guidelines
- This is a HIGH STAKES project with real capital at risk
- Client expects institutional-grade quality
- Always use React + Vite, NEVER Next.js
- Maintain microservices architecture
- Always prioritize risk management over returns
- Document everything for handover

---
*This memory should be referenced by all agents working on this project*
*Last Updated: August 15, 2025 - Phase 1 Complete*
*Critical: This project uses React + Vite, NOT Next.js*