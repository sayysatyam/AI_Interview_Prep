
const PLANS = {
  go: {
    code: "go",
    name: "Go",
    amountPaise: 29900,
    credits: 300,
    description: "Get started with essential features.",
    active: true,
  },

  plus: {
    code: "plus",
    name: "Plus",
    amountPaise: 100000,
    credits: 2500,
    description: "More credits for regular usage.",
    active: true,
  },

  pro: {
    code: "pro",
    name: "Pro",
    amountPaise: 1069900,
    credits: 15000,
    description: "Maximum credits for intensive usage.",
    active: true,
  },
};

module.exports = { PLANS };
