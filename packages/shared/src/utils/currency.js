"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectRateByDate = selectRateByDate;
exports.priceFromCost = priceFromCost;
exports.costFromPrice = costFromPrice;
exports.calculateMargin = calculateMargin;
exports.calculateProfit = calculateProfit;
exports.formatCurrency = formatCurrency;
exports.calculateVat = calculateVat;
exports.calculateGross = calculateGross;
function selectRateByDate(rates, date) {
    if (!rates || rates.length === 0) {
        throw new Error('No exchange rates available');
    }
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const validRates = rates.filter((rate) => {
        const rateDate = new Date(rate.rateDate);
        rateDate.setHours(0, 0, 0, 0);
        return rateDate <= targetDate;
    });
    if (validRates.length === 0) {
        throw new Error(`No exchange rate found on or before ${date.toISOString()}`);
    }
    const sortedRates = validRates.sort((a, b) => {
        return new Date(b.rateDate).getTime() - new Date(a.rateDate).getTime();
    });
    const selectedRate = sortedRates[0];
    if (selectedRate.rate <= 0) {
        throw new Error('Invalid exchange rate: rate must be positive');
    }
    return selectedRate.rate;
}
function priceFromCost(costTry, markupPct, rate) {
    if (costTry < 0) {
        throw new Error('Cost cannot be negative');
    }
    if (markupPct < 0) {
        throw new Error('Markup percentage cannot be negative');
    }
    if (rate <= 0) {
        throw new Error('Exchange rate must be positive');
    }
    const costWithMarkup = costTry * (1 + markupPct / 100);
    const sellPriceEur = costWithMarkup / rate;
    return Math.round(sellPriceEur * 100) / 100;
}
function costFromPrice(sellPriceEur, markupPct, rate) {
    if (sellPriceEur < 0) {
        throw new Error('Sell price cannot be negative');
    }
    if (markupPct < 0) {
        throw new Error('Markup percentage cannot be negative');
    }
    if (rate <= 0) {
        throw new Error('Exchange rate must be positive');
    }
    const priceInTry = sellPriceEur * rate;
    const costTry = priceInTry / (1 + markupPct / 100);
    return Math.round(costTry * 100) / 100;
}
function calculateMargin(sellPriceEur, costTry, rate) {
    if (sellPriceEur <= 0) {
        return 0;
    }
    if (rate <= 0) {
        throw new Error('Exchange rate must be positive');
    }
    const costEur = costTry / rate;
    const margin = ((sellPriceEur - costEur) / sellPriceEur) * 100;
    return Math.round(margin * 100) / 100;
}
function calculateProfit(sellPriceEur, costTry, rate) {
    if (rate <= 0) {
        throw new Error('Exchange rate must be positive');
    }
    const costEur = costTry / rate;
    const profit = sellPriceEur - costEur;
    return Math.round(profit * 100) / 100;
}
function formatCurrency(amount, currency, locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}
function calculateVat(netAmount, vatRate) {
    if (netAmount < 0) {
        throw new Error('Net amount cannot be negative');
    }
    if (vatRate < 0) {
        throw new Error('VAT rate cannot be negative');
    }
    const vatAmount = netAmount * (vatRate / 100);
    return Math.round(vatAmount * 100) / 100;
}
function calculateGross(netAmount, vatRate) {
    const vatAmount = calculateVat(netAmount, vatRate);
    return Math.round((netAmount + vatAmount) * 100) / 100;
}
//# sourceMappingURL=currency.js.map