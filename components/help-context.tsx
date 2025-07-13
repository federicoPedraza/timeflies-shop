"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { usePathname } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuth } from "@/components/AuthProvider"

interface HelpStep {
  id: string
  title: string
  content: string
  target?: string
}

interface HelpContextType {
  isHelpOpen: boolean
  openHelp: () => void
  closeHelp: () => void
  currentHelpSteps: HelpStep[]
  currentHelpTitle: string
  currentStep: number
  setCurrentStep: (step: number) => void
}

const HelpContext = createContext<HelpContextType | undefined>(undefined)

export function useHelp() {
  const context = useContext(HelpContext)
  if (context === undefined) {
    throw new Error("useHelp must be used within a HelpProvider")
  }
  return context
}

interface HelpProviderProps {
  children: ReactNode
}

export function HelpProvider({ children }: HelpProviderProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const pathname = usePathname()
  const { userId } = useAuth()
  const markOnboardingAsSeen = useMutation(api.auth.markOnboardingAsSeen)

  // Effect to handle automatic actions based on help step
  useEffect(() => {
    if (!isHelpOpen) return

    const currentStepData = getHelpContent().steps[currentStep]
    if (!currentStepData) return

    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      // Handle orders page specific actions
      if (pathname === "/orders") {
        switch (currentStepData.id) {
          case "orders-page-title": {
            // Open the filters section
            const filterButton = document.querySelector('[data-testid="orders-filters"] button[aria-label*="Expand"]') as HTMLButtonElement
            if (filterButton) {
              filterButton.click()
            }
            // Select the first order
            const ordersTable = document.querySelector('[data-testid="orders-table"]')
            if (ordersTable) {
              const firstOrderRow = ordersTable.querySelector('tbody tr') as HTMLTableRowElement
              if (firstOrderRow && !firstOrderRow.classList.contains('bg-blue-50')) {
                firstOrderRow.click()
              }
            }
            // Re-open the orders table if collapsed
            const collapseButton = document.querySelector('[data-testid="orders-table"] button[aria-label*="Collapse"]') as HTMLButtonElement
            if (collapseButton) {
              collapseButton.click()
            }
            break
          }
          case "orders-filters":
            // Open the filters section
            const filterButton = document.querySelector('[data-testid="orders-filters"] button[aria-label*="Expand"]') as HTMLButtonElement
            if (filterButton) {
              filterButton.click()
            }
            break
          case "orders-table":
            // Ensure table is visible (collapse any inspected order)
            const collapseButton = document.querySelector('[data-testid="orders-table"] button[aria-label*="Collapse"]') as HTMLButtonElement
            if (collapseButton) {
              collapseButton.click()
            }
            break
          case "column-toggle":
            // Open the column toggle dropdown
            const columnToggle = document.querySelector('[data-testid="column-toggle"]') as HTMLButtonElement
            if (columnToggle) {
              columnToggle.click()
            }
            break
          case "order-details-customer":
          case "order-details-payment":
          case "order-details-shipping-address":
          case "order-details-shipping-info":
          case "order-details-products":
          case "order-details-summary":
          case "order-actions":
            // Order should already be selected from the first step
            break
        }
      }

      // Handle products page specific actions
      if (pathname === "/products") {
        switch (currentStepData.id) {
          case "products-page-title": {
            // Open the filters section
            const filterButton = document.querySelector('[data-testid="products-filters"] button[aria-label*="Expand"]') as HTMLButtonElement
            if (filterButton) {
              filterButton.click()
            }
            // Select the first product (target the first Card in the grid)
            const productsTable = document.querySelector('[data-testid="products-table"]')
            if (productsTable) {
              const firstProductCard = productsTable.querySelector('.grid .group') as HTMLElement
              if (firstProductCard && !firstProductCard.classList.contains('bg-blue-50')) {
                firstProductCard.click()
              }
            }
            break
          }
          case "products-filters":
            // Open the filters section
            const filterButton = document.querySelector('[data-testid="products-filters"] button[aria-label*="Expand"]') as HTMLButtonElement
            if (filterButton) {
              filterButton.click()
            }
            break
          case "products-table":
          case "product-details":
          case "product-details-basic":
          case "product-details-pricing":
          case "product-details-inventory":
          case "product-details-financial":
          case "product-details-description":
          case "product-details-seo":
          case "product-details-status":
          case "product-details-images":
            // Product should already be selected from the first step
            break
        }
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [isHelpOpen, currentStep, pathname])

  const overviewHelpSteps: HelpStep[] = [
    {
      id: "eye-button",
      title: "Hide Financial Information",
      content: "Click the eye icon next to 'Dashboard Overview' to hide or show financial information like revenue and profit data. This is useful when sharing your screen or when you want to focus on other metrics.",
      target: "button[title*='financial']"
    },
    {
      id: "stats-cards",
      title: "Stats Cards Overview",
      content: "These cards show your key business metrics at a glance. You can click on any card to get more detailed information. Each card represents a different aspect of your business performance.",
      target: "[data-testid='stats-cards']"
    },
    {
      id: "revenue-chart-toggle",
      title: "Chart Interaction",
      content: "Click on the 'Total Revenue' or 'Clocks Sold' cards to switch the chart below. The chart will update to show the corresponding data visualization for the selected metric.",
      target: "[data-testid='revenue-card']"
    },
    {
      id: "activity-chart",
      title: "Activity Heat Chart",
      content: "This is a heat chart showing your store's activity over time. Darker colors indicate higher activity levels, while lighter colors show periods of lower activity. It helps you identify patterns and peak activity times.",
      target: "[data-testid='activity-chart']"
    },
    {
      id: "recent-activity",
      title: "Recent Activity Feed",
      content: "This section shows real-time webhook events and system activities. It displays recent orders, product updates, and other important events happening in your store. Keep an eye on this to stay updated on your store's activity.",
      target: "[data-testid='recent-activity']"
    },
    {
      id: "sidebar-navigation",
      title: "Navigation Sidebar",
      content: "Use the sidebar to navigate between different pages. You'll find detailed views for Orders, Products, Analytics, Customers, and Settings. Each page provides specific tools and insights for managing your clock store.",
      target: "[data-testid='sidebar']"
    },
    {
      id: "help-button",
      title: "Help is Always Available",
      content: "You can click the Help button on any page to get contextual guidance about what you're looking at. Good luck with your clock store! 🕰️",
      target: "[data-testid='help-button']"
    }
  ]

  const ordersHelpSteps: HelpStep[] = [
    {
      id: "orders-page-title",
      title: "Orders Management",
      content: "This is your orders management page where you can view, filter, and manage all customer orders. You'll find tools to search, filter, and inspect order details.",
      target: "[data-testid='orders-page-title']"
    },
    {
      id: "orders-filters",
      title: "Advanced Filters",
      content: "Use these filters to find specific orders. You can filter by order status, payment status, date range, amount, and search by customer name or order number. The filters help you quickly locate the orders you need.",
      target: "[data-testid='orders-filters']"
    },
    {
      id: "orders-table",
      title: "Orders Table",
      content: "This table displays all your orders with key information. Click on any row to view detailed order information. The table shows order status, customer details, products, payment info, and total amounts.",
      target: "[data-testid='orders-table']"
    },
    {
      id: "column-toggle",
      title: "Customize Columns",
      content: "Click the column toggle button to show or hide specific columns in the table. This helps you focus on the information that matters most to you.",
      target: "[data-testid='column-toggle']"
    },
    {
      id: "order-details-customer",
      title: "Customer Information",
      content: "This section shows the customer's contact details including name, email, and phone number. You can use this information to contact customers about their orders.",
      target: "[data-testid='order-details-customer']"
    },
    {
      id: "order-details-payment",
      title: "Payment Information",
      content: "View payment status, method, and transaction details. This helps you track which orders are paid and which need attention.",
      target: "[data-testid='order-details-payment']"
    },
    {
      id: "order-details-shipping-address",
      title: "Shipping Address",
      content: "The complete shipping address for this order. This information is used for delivery and can be shared with shipping providers.",
      target: "[data-testid='order-details-shipping-address']"
    },
    {
      id: "order-details-shipping-info",
      title: "Shipping Information",
      content: "Shipping costs and delivery details. This shows both customer and merchant shipping costs for transparency.",
      target: "[data-testid='order-details-shipping-info']"
    },
    {
      id: "order-details-products",
      title: "Products List",
      content: "All products included in this order with quantities, prices, and images. This gives you a complete view of what the customer purchased.",
      target: "[data-testid='order-details-products']"
    },
    {
      id: "order-details-summary",
      title: "Order Summary",
      content: "A complete breakdown of the order including subtotal, taxes, shipping, discounts, and final total. This helps you understand the complete order value.",
      target: "[data-testid='order-details-summary']"
    },
    {
      id: "order-actions",
      title: "Order Actions",
      content: "Use these buttons to inspect the order in detail, search for other orders from the same customer, or share order information. These tools help you manage orders effectively.",
      target: "[data-testid='order-actions']"
    }
  ]

  const orderDetailsHelpSteps: HelpStep[] = [
    {
      id: "order-header",
      title: "Order Header",
      content: "Welcome to the order details! Here you’ll find the order number, who placed it, and quick actions to share, view in TiendaNube, or check out the customer’s profile. This is your command center for everything about this order.",
      target: "[data-testid='order-header']"
    },
    {
      id: "order-details-customer",
      title: "Customer Information",
      content: "Here’s who made the purchase! You’ll find the customer’s name, email, and phone number—perfect for reaching out if you need to confirm details or provide updates.",
      target: "[data-testid='order-details-customer']"
    },
    {
      id: "order-details-payment",
      title: "Payment Information",
      content: "Track the money flow: see how the customer paid, the payment status, and the total amount. This section helps you quickly spot if anything needs your attention.",
      target: "[data-testid='order-details-payment']"
    },
    {
      id: "order-details-shipping-address",
      title: "Shipping Details",
      content: "Where’s it going? This section shows the full shipping address and delivery info, so you can make sure the order gets to the right place, every time.",
      target: "[data-testid='order-details-shipping-address']"
    },
    {
      id: "order-details-products",
      title: "Products List",
      content: "Everything in the box! Here you’ll see all the products included in this order, with quantities and prices. Great for double-checking what’s being shipped.",
      target: "[data-testid='order-details-products']"
    },
    {
      id: "order-details-summary",
      title: "Order Summary",
      content: "Get the big picture: this summary breaks down the subtotal, shipping, taxes, discounts, and the final total. It’s your one-stop spot for the order’s financials.",
      target: "[data-testid='order-details-summary']"
    },
    {
      id: "order-details-notes",
      title: "Order Notes",
      content: "Special instructions or comments from the customer or your team will appear here. Don’t miss any important details!",
      target: "[data-testid='order-details-notes']"
    }
  ];

  const analyticsHelpSteps: HelpStep[] = [
    {
      id: "analytics-header",
      title: "Analytics Dashboard Overview",
      content: "Welcome to your Analytics dashboard! This is your business intelligence center where you can track performance, identify trends, and make data-driven decisions. Each section provides different insights into your clock store's health and growth opportunities.",
      target: "h1.text-2xl"
    },
    {
      id: "profits-section",
      title: "Profits & Revenue Section",
      content: "This section shows your financial performance at a glance. Revenue is your total sales before costs, while profits are what you actually keep. Understanding the difference helps you price products correctly and identify which items are most profitable for your business.",
      target: "[data-testid='analytics-profits-section']"
    },
    {
      id: "revenue-chart",
      title: "Revenue Trend Chart",
      content: "This chart shows your daily revenue over time. Each point represents one day's total sales. Look for patterns: spikes might indicate successful promotions or busy periods, while dips could show seasonal trends or issues. Hover over points to see exact amounts. Use this to plan inventory and marketing campaigns around your best-performing days.",
      target: "[data-testid='analytics-revenue-chart']"
    },
    {
      id: "profit-margin",
      title: "Profit Margin Explained",
      content: "Profit margin is the percentage of revenue that becomes profit after costs. For example, a 25% margin means for every $100 in sales, you keep $25 as profit. Higher margins mean more money for growth and reinvestment. If your margin is low, consider raising prices or reducing costs. Industry average for retail is typically 15-30%.",
      target: "[data-testid='analytics-key-metrics']"
    },
    {
      id: "total-profit",
      title: "Total Profit Breakdown",
      content: "This is your actual earnings after all costs (product costs, shipping, fees, etc.). Unlike revenue, this is the money you can reinvest or take as income. Compare this to your revenue to understand your cost structure. If profit is much lower than revenue, you may need to optimize pricing or reduce expenses.",
      target: "[data-testid='analytics-key-metrics']"
    },
    {
      id: "top-performing-day",
      title: "Top Performing Day Analysis",
      content: "This shows your single best day for revenue. Understanding what made this day successful (promotions, events, product launches, etc.) can help you replicate that success. Look for patterns: was it a weekend, holiday, or after a marketing campaign? Use this insight to plan future high-impact activities.",
      target: "[data-testid='analytics-key-metrics']"
    },
    {
      id: "revenue-trend",
      title: "Revenue Trend Direction",
      content: "This indicator shows whether your revenue is increasing, decreasing, or stable over time. An increasing trend suggests your business is growing, while decreasing might indicate market changes or operational issues. Stable trends are good for established businesses. Use this to validate if your strategies are working.",
      target: "[data-testid='analytics-key-metrics']"
    },
    {
      id: "total-costs",
      title: "Total Costs Breakdown",
      content: "This represents all your business expenses: product costs, shipping, platform fees, marketing, and overhead. Understanding your total costs helps you set appropriate prices and identify areas for cost reduction. If costs are rising faster than revenue, you need to address efficiency or pricing.",
      target: "[data-testid='analytics-key-metrics']"
    },
    {
      id: "performance-section",
      title: "Product Performance Analytics",
      content: "This section reveals which products are your stars and which need attention. You'll see sales volume, revenue contribution, and performance trends for each product. Use this to optimize your inventory: stock more of your best sellers and either improve or discontinue underperformers. This data helps you make informed decisions about product development and marketing focus.",
      target: "[data-testid='analytics-performance-section']"
    },
    {
      id: "product-ranking-list",
      title: "Product Sales Ranking",
      content: "This list shows your products ranked by sales performance over the last 6 months. Gold, silver, and bronze awards indicate your top 3 performers. Click any product to see detailed analytics. The ranking helps you identify which products to promote, which to reorder, and which might need pricing or marketing adjustments.",
      target: "[data-testid='product-ranking-list']"
    },
    {
      id: "product-performance-summary",
      title: "Performance Overview",
      content: "These summary stats show the big picture: how many products you've sold, total units moved, revenue generated, and current stock levels. This gives you a quick snapshot of your product portfolio's health and helps you understand your overall product performance at a glance.",
      target: "[data-testid='product-performance-summary']"
    },
    {
      id: "product-detail-analysis",
      title: "Individual Product Deep Dive",
      content: "When you select a product, you get detailed analytics including sales metrics, stock analysis, and performance trends. This helps you understand each product's contribution to your business and make data-driven decisions about inventory, pricing, and marketing strategies.",
      target: "[data-testid='product-detail-analysis']"
    },
    {
      id: "product-performance-metrics",
      title: "Key Performance Metrics",
      content: "These four metrics tell the complete story: Total Units Sold (sales volume), Total Revenue (financial impact), Total Orders (customer demand), and Average Price (pricing effectiveness). Together they help you understand if a product is selling well, generating profit, and priced correctly.",
      target: "[data-testid='product-performance-metrics']"
    },
    {
      id: "stock-analysis-section",
      title: "Stock Analysis & Demand Insights",
      content: "This section provides advanced inventory intelligence. It analyzes your current stock levels against sales patterns to predict future demand, identify stockout risks, and optimize your inventory investment. This data helps you maintain the right stock levels to maximize sales while minimizing holding costs.",
      target: "[data-testid='stock-analysis-section']"
    },
    {
      id: "stock-status-alert",
      title: "Stock Status Alerts",
      content: "This alert system automatically analyzes your stock levels and provides recommendations. Red alerts mean you're at risk of running out, yellow warnings suggest you might be overstocked, and green indicates optimal levels. Follow the recommendations to maintain healthy inventory levels.",
      target: "[data-testid='stock-status-alert']"
    },
    {
      id: "stock-metrics-grid",
      title: "Stock Intelligence Metrics",
      content: "Current Stock shows what you have now. Sell Rate tells you how many units you sell per day. Days of Stock Left predicts when you'll run out. Stock Efficiency measures how well you're managing inventory (higher is better). Use these metrics to time reorders perfectly and avoid stockouts.",
      target: "[data-testid='stock-metrics-grid']"
    },
    {
      id: "demand-analysis",
      title: "Demand & Turnover Analysis",
      content: "Demand Score shows your daily revenue potential based on current sales patterns. Stock Turnover Rate measures how quickly you sell through inventory (higher rates mean faster sales). These metrics help you understand product popularity and optimize your inventory investment for maximum returns.",
      target: "[data-testid='demand-analysis']"
    },
    {
      id: "daily-performance-charts",
      title: "Daily Performance Trends",
      content: "These charts show your product's performance over the last 30 days. The revenue chart reveals daily sales patterns and peak performance days. The units chart shows sales volume trends. Use these to identify patterns, plan promotions around peak days, and understand seasonal demand.",
      target: "[data-testid='daily-performance-charts']"
    },
    {
      id: "additional-metrics",
      title: "Peak Performance Insights",
      content: "Peak Daily Revenue shows your best single day's sales. Peak Daily Units reveals your highest volume day. Average Daily Revenue gives you a baseline for normal performance. These metrics help you understand your product's potential and identify what drives exceptional performance.",
      target: "[data-testid='additional-metrics']"
    },
    {
      id: "inventory-section",
      title: "Stock Analytics & Inventory Management",
      content: "This section helps you maintain optimal inventory levels. You'll see which products are running low, which are overstocked, and stock turnover rates. Low stock alerts help prevent missed sales, while overstock analysis prevents tying up capital in slow-moving items. Good inventory management improves cash flow and customer satisfaction by ensuring products are available when customers want them.",
      target: "[data-testid='analytics-inventory-section']"
    },
    {
      id: "stock-analytics-summary",
      title: "Inventory Overview",
      content: "These four key metrics give you a complete picture of your inventory health: Total Stock (how much you have), Stock Value (what it's worth), Products with Stock (how many are available), and Out of Stock (how many need restocking). This helps you understand your inventory investment and identify immediate action items.",
      target: "[data-testid='stock-analytics-summary']"
    },
    {
      id: "stock-filters",
      title: "Inventory Filters",
      content: "Use these filters to focus on specific inventory concerns. Search by product name or SKU to find specific items. Set minimum stock thresholds to identify low-stock products. Toggle to show only products with stock or all products. These tools help you quickly identify inventory issues that need attention.",
      target: "[data-testid='stock-filters']"
    },
    {
      id: "product-selection",
      title: "Product Selection for Analysis",
      content: "Click on products to include or exclude them from the inventory distribution chart. Products with blue backgrounds are included in the analysis. This helps you focus on specific product categories or identify which products are consuming most of your inventory investment.",
      target: "[data-testid='product-selection']"
    },
    {
      id: "inventory-distribution-chart",
      title: "Inventory Distribution Visualization",
      content: "This pie chart shows how your stock is distributed across products. Larger slices represent products with more inventory. This helps you identify if you're over-invested in certain products or if your inventory is well-balanced. Use this to optimize your inventory allocation and identify products that might need stock adjustments.",
      target: "[data-testid='inventory-distribution-chart']"
    },
    {
      id: "stock-value-breakdown",
      title: "Stock Value Analysis",
      content: "This detailed list shows each product's stock quantity, percentage of total inventory, and stock value. It helps you understand where your inventory investment is concentrated and identify opportunities to optimize stock levels. Products with high stock values but low turnover might be candidates for stock reduction.",
      target: "[data-testid='stock-value-breakdown']"
    },
    {
      id: "coming-soon-section",
      title: "Future Analytics Features",
      content: "More powerful insights are coming! Customer Insights will show buying patterns, demographics, and customer lifetime value. Shipping Analytics will track delivery performance and costs. Advanced Analytics will include predictive trends and AI-powered recommendations. These tools will help you make even smarter business decisions and stay ahead of the competition.",
      target: "[data-testid='analytics-coming-soon']"
    },
    {
      id: "help-reminder",
      title: "Using Analytics for Growth",
      content: "Remember: data is only valuable when you act on it! Use these insights to adjust pricing, optimize inventory, plan promotions, and identify growth opportunities. Click the Help button anytime to revisit this tour or get guidance on other pages. Your analytics dashboard is your roadmap to business success! 📊",
      target: "[data-testid='help-button']"
    }
  ]

  const productsHelpSteps: HelpStep[] = [
    {
      id: "products-page-title",
      title: "Product Catalog Management Hub",
      content: "Welcome to your Product Catalog Management Hub! This is where you transform your product data into business intelligence. Here you'll learn to optimize inventory levels, analyze pricing strategies, identify your best and worst performers, and make data-driven decisions that directly impact your profitability. Think of this as your command center for product strategy.",
      target: "[data-testid='products-page-title']"
    },
    {
      id: "products-filters",
      title: "Advanced Product Intelligence Filters",
      content: "These filters are your product intelligence tools. Search by name or SKU to find specific items quickly. Filter by stock status to identify products needing restocking or those with excess inventory. Use category filters to analyze performance by product type. Price range filters help you identify pricing opportunities. The filter count badge shows your active intelligence queries. These tools help you segment your product portfolio for targeted analysis and action.",
      target: "[data-testid='products-filters']"
    },
    {
      id: "products-table",
      title: "Product Performance Intelligence Dashboard",
      content: "This is your product performance intelligence dashboard. Each product card shows critical business metrics: profit margins (the percentage of revenue that becomes profit), stock levels with color-coded status indicators, pricing strategy (including compare-at prices for promotional analysis), and performance badges (Best Seller, High Margin, On Sale, etc.). Click any product to dive deep into its performance data. Use this to identify which products are your stars, which need attention, and which might be candidates for discontinuation or price optimization.",
      target: "[data-testid='products-table']"
    },
    {
      id: "product-details",
      title: "Comprehensive Product Intelligence Analysis",
      content: "This detailed product analysis provides complete business intelligence. You'll see pricing strategy breakdown (current price, compare-at price, cost, profit margin), inventory health metrics (stock levels, low stock thresholds, days of inventory remaining), financial projections (potential revenue, inventory value, profit per unit), and performance indicators. This data helps you make informed decisions about reordering, pricing adjustments, marketing focus, and inventory optimization. Use these insights to maximize profitability and minimize carrying costs.",
      target: "[data-testid='product-details']"
    },
    {
      id: "product-details-basic",
      title: "Product Identity & Classification Intelligence",
      content: "This section reveals the product's market positioning and categorization strategy. The category and subcategory show how the product fits into your catalog structure and helps customers find it. The brand information indicates the product's market positioning and target audience. The product ID is your unique identifier for tracking this item across all systems. Understanding this classification helps you optimize your catalog structure and improve discoverability.",
      target: "[data-testid='product-details-basic']"
    },
    {
      id: "product-details-pricing",
      title: "Strategic Pricing Intelligence & Profitability Analysis",
      content: "This is your pricing strategy intelligence center. The current price represents your market positioning and revenue strategy. Compare-at prices show your promotional strategy and perceived value. Cost price reveals your margin structure and purchasing efficiency. Profit margin percentage indicates the product's profitability relative to revenue. Higher margins mean more money for growth and reinvestment. Use this data to optimize pricing strategies, identify margin improvement opportunities, and understand your competitive positioning.",
      target: "[data-testid='product-details-pricing']"
    },
    {
      id: "product-details-inventory",
      title: "Inventory Health & Stock Management Intelligence",
      content: "This section provides critical inventory intelligence. Current stock levels show your inventory investment and availability. Low stock thresholds help you maintain optimal inventory levels and prevent stockouts. Stock status indicators (In Stock, Low Stock, Out of Stock) provide immediate visual feedback on inventory health. Weight information affects shipping costs and logistics planning. This data helps you optimize inventory levels to maximize sales while minimizing carrying costs and stockout risks.",
      target: "[data-testid='product-details-inventory']"
    },
    {
      id: "product-details-financial",
      title: "Financial Performance & Investment Intelligence",
      content: "This financial intelligence section shows the product's complete economic impact. Profit per unit reveals the direct contribution of each sale. Potential revenue shows the maximum revenue if all current stock is sold. Inventory value represents your current investment in this product. These metrics help you understand the product's return on investment, cash flow impact, and overall financial contribution. Use this data to make decisions about inventory investment, pricing optimization, and product lifecycle management.",
      target: "[data-testid='product-details-financial']"
    },
    {
      id: "product-details-description",
      title: "Product Value Proposition & Marketing Intelligence",
      content: "The product description is your value proposition and marketing intelligence. This content directly impacts conversion rates and customer understanding. Well-written descriptions improve SEO, reduce customer questions, and increase sales. Analyze this content to ensure it clearly communicates the product's benefits, features, and value. Consider how the description aligns with your target audience and marketing strategy. This is often the deciding factor in customer purchase decisions.",
      target: "[data-testid='product-details-description']"
    },
    {
      id: "product-details-seo",
      title: "Search Engine Optimization & Discoverability Intelligence",
      content: "This SEO intelligence section shows how well your product is optimized for search engines and customer discovery. SEO title and description directly impact search rankings and click-through rates. Well-optimized products appear higher in search results and attract more qualified traffic. This data helps you understand the product's online visibility and discoverability. Use this information to improve search rankings, increase organic traffic, and optimize your product's online presence.",
      target: "[data-testid='product-details-seo']"
    },
    {
      id: "product-details-status",
      title: "Product Lifecycle & Market Intelligence",
      content: "This status intelligence section shows the product's market readiness and lifecycle position. Published status indicates whether the product is live and available to customers. Free shipping status affects conversion rates and customer perception of value. Video URL presence can significantly increase engagement and conversion rates. These factors directly impact the product's market performance and customer appeal. Use this data to optimize the product's market presence and competitive positioning.",
      target: "[data-testid='product-details-status']"
    },
    {
      id: "product-details-images",
      title: "Visual Marketing & Conversion Intelligence",
      content: "This visual intelligence section shows your product's visual marketing strategy. High-quality images are crucial for conversion rates and customer confidence. Multiple images from different angles help customers understand the product better and reduce returns. Image quality directly impacts perceived value and purchase decisions. This gallery represents your visual value proposition and marketing investment. Use this data to optimize your visual marketing strategy and improve conversion rates.",
      target: "[data-testid='product-details-images']"
    }
  ]

  const productDetailsHelpSteps: HelpStep[] = [
    {
      id: "product-header",
      title: "Product Intelligence Command Center",
      content: "Welcome to your Product Intelligence Command Center! Here you'll find comprehensive data about this specific product's performance, profitability, and business impact. The header shows the product's identity and provides quick actions for sharing, viewing in your store, or accessing the TiendaNube admin. This is your single source of truth for everything about this product's contribution to your business.",
      target: "h1.text-2xl"
    },
    {
      id: "product-details-basic",
      title: "Product Identity & Classification Intelligence",
      content: "This section reveals the product's market positioning and categorization strategy. The category and subcategory show how the product fits into your catalog structure and helps customers find it. The brand information indicates the product's market positioning and target audience. The product ID is your unique identifier for tracking this item across all systems. Understanding this classification helps you optimize your catalog structure and improve discoverability.",
      target: "[data-testid='product-details-basic']"
    },
    {
      id: "product-details-pricing",
      title: "Strategic Pricing Intelligence & Profitability Analysis",
      content: "This is your pricing strategy intelligence center. The current price represents your market positioning and revenue strategy. Compare-at prices show your promotional strategy and perceived value. Cost price reveals your margin structure and purchasing efficiency. Profit margin percentage indicates the product's profitability relative to revenue. Higher margins mean more money for growth and reinvestment. Use this data to optimize pricing strategies, identify margin improvement opportunities, and understand your competitive positioning.",
      target: "[data-testid='product-details-pricing']"
    },
    {
      id: "product-details-inventory",
      title: "Inventory Health & Stock Management Intelligence",
      content: "This section provides critical inventory intelligence. Current stock levels show your inventory investment and availability. Low stock thresholds help you maintain optimal inventory levels and prevent stockouts. Stock status indicators (In Stock, Low Stock, Out of Stock) provide immediate visual feedback on inventory health. Weight information affects shipping costs and logistics planning. This data helps you optimize inventory levels to maximize sales while minimizing carrying costs and stockout risks.",
      target: "[data-testid='product-details-inventory']"
    },
    {
      id: "product-details-financial",
      title: "Financial Performance & Investment Intelligence",
      content: "This financial intelligence section shows the product's complete economic impact. Profit per unit reveals the direct contribution of each sale. Potential revenue shows the maximum revenue if all current stock is sold. Inventory value represents your current investment in this product. These metrics help you understand the product's return on investment, cash flow impact, and overall financial contribution. Use this data to make decisions about inventory investment, pricing optimization, and product lifecycle management.",
      target: "[data-testid='product-details-financial']"
    },
    {
      id: "product-details-description",
      title: "Product Value Proposition & Marketing Intelligence",
      content: "The product description is your value proposition and marketing intelligence. This content directly impacts conversion rates and customer understanding. Well-written descriptions improve SEO, reduce customer questions, and increase sales. Analyze this content to ensure it clearly communicates the product's benefits, features, and value. Consider how the description aligns with your target audience and marketing strategy. This is often the deciding factor in customer purchase decisions.",
      target: "[data-testid='product-details-description']"
    },
    {
      id: "product-details-seo",
      title: "Search Engine Optimization & Discoverability Intelligence",
      content: "This SEO intelligence section shows how well your product is optimized for search engines and customer discovery. SEO title and description directly impact search rankings and click-through rates. Well-optimized products appear higher in search results and attract more qualified traffic. This data helps you understand the product's online visibility and discoverability. Use this information to improve search rankings, increase organic traffic, and optimize your product's online presence.",
      target: "[data-testid='product-details-seo']"
    },
    {
      id: "product-details-status",
      title: "Product Lifecycle & Market Intelligence",
      content: "This status intelligence section shows the product's market readiness and lifecycle position. Published status indicates whether the product is live and available to customers. Free shipping status affects conversion rates and customer perception of value. Video URL presence can significantly increase engagement and conversion rates. These factors directly impact the product's market performance and customer appeal. Use this data to optimize the product's market presence and competitive positioning.",
      target: "[data-testid='product-details-status']"
    },
    {
      id: "product-details-images",
      title: "Visual Marketing & Conversion Intelligence",
      content: "This visual intelligence section shows your product's visual marketing strategy. High-quality images are crucial for conversion rates and customer confidence. Multiple images from different angles help customers understand the product better and reduce returns. Image quality directly impacts perceived value and purchase decisions. This gallery represents your visual value proposition and marketing investment. Use this data to optimize your visual marketing strategy and improve conversion rates.",
      target: "[data-testid='product-details-images']"
    }
  ]

  const customersHelpSteps: HelpStep[] = [
    {
      id: "customers-header",
      title: "Customer Intelligence Hub",
      content: "Welcome to your Customer Intelligence Hub! This is where you'll gain deep insights into your customer base, understand buying patterns, identify your most valuable customers, and optimize your marketing strategies. While this feature is currently under development, it will become your most powerful tool for customer relationship management and business growth.",
      target: "h2.text-2xl"
    },
    {
      id: "customers-under-development",
      title: "Customer Analytics Coming Soon",
      content: "We're building a comprehensive customer analytics system that will provide you with detailed insights about your customer base. This will include customer segmentation, purchase history analysis, lifetime value calculations, and behavioral patterns. The system will help you make data-driven decisions to improve customer retention and increase sales.",
      target: "[data-testid='customers-under-development']"
    },
    {
      id: "customer-statistics-preview",
      title: "Future Customer Statistics",
      content: "When complete, you'll have access to powerful customer statistics including: Total customers, New customers per period, Customer lifetime value, Average order value, Customer retention rates, Geographic distribution, Purchase frequency, and Customer satisfaction scores. These metrics will help you understand your customer base and optimize your business strategies.",
      target: "[data-testid='customers-under-development']"
    },
    {
      id: "customer-segmentation",
      title: "Customer Segmentation Features",
      content: "You'll be able to segment your customers by various criteria: High-value customers, Frequent buyers, New customers, At-risk customers, Geographic segments, and Purchase behavior patterns. This segmentation will enable targeted marketing campaigns and personalized customer experiences that drive loyalty and sales.",
      target: "[data-testid='customers-under-development']"
    },
    {
      id: "customer-actions",
      title: "Customer Management Actions",
      content: "Future features will include: Customer profile management, Communication history, Order tracking per customer, Customer support integration, Loyalty program management, and Automated marketing workflows. These tools will help you build stronger relationships with your customers and increase their lifetime value.",
      target: "[data-testid='customers-under-development']"
    },
    {
      id: "notify-me-section",
      title: "Stay Updated with Notifications",
      content: "Don't miss out when customer analytics goes live! Click the 'Notify Me' button below to get notified when this powerful feature becomes available. You'll be among the first to know when you can start analyzing your customer data and making smarter business decisions based on customer insights.",
      target: "[data-testid='notify-me-section']"
    },
    {
      id: "easter-egg-hint",
      title: "Pro Tip: Try the Notify Button!",
      content: "While you're here, try clicking the 'Notify Me' button a few times... you might discover something fun! 🎉 This is a great way to test the notification system while you wait for the real customer analytics features to arrive.",
      target: "[data-testid='notify-me-section']"
    }
  ]

  const settingsHelpSteps: HelpStep[] = [
    {
      id: "settings-header",
      title: "Settings & Configuration Hub",
      content: "Welcome to your Settings & Configuration Hub! This is your command center for managing store connections, webhooks, data synchronization, and system preferences. Here you can monitor connection health, configure automatic data sync, and ensure your Timeflies app is properly integrated with your e-commerce platform.",
      target: "h2.text-2xl"
    },
    {
      id: "sidebar-settings-indicator",
      title: "Settings Sidebar Indicator",
      content: "Notice the red dot on the Settings icon in the sidebar? This indicates there's a connection issue with Tiendanube or another provider. The red indicator appears when there are authentication problems, API errors, or network connectivity issues. Click on Settings to investigate and resolve these connection problems.",
      target: "[data-testid='sidebar']"
    },
    {
      id: "abandoned-checkouts-section",
      title: "Abandoned Checkouts Management",
      content: "This section helps you manage abandoned shopping carts from your store. Abandoned checkouts are when customers add items to their cart but don't complete the purchase. You can see how many abandoned checkouts exist and dismiss them to clean up your data. In the future, you'll be able to analyze these patterns to improve your conversion rates and recover lost sales.",
      target: "[data-testid='abandoned-checkouts-section']"
    },
    {
      id: "ecommerce-connection-section",
      title: "E-Commerce Connection Management",
      content: "This is your primary connection hub for Tiendanube integration. Here you can monitor the connection status, sync products, orders, and checkouts, and access your store directly. The connection status badge shows whether your integration is working properly. Green means connected, red means disconnected, and gray means checking status.",
      target: "[data-testid='ecommerce-connection-section']"
    },
    {
      id: "tiendanube-status",
      title: "Tiendanube Connection Status",
      content: "This shows your current connection status with Tiendanube. When connected (green badge), you can sync data and configure webhooks. When disconnected (red badge), you'll see error messages explaining the issue. Common problems include expired API tokens, network issues, or store configuration changes. The status updates automatically every few minutes.",
      target: "[data-testid='tiendanube-status']"
    },
    {
      id: "sync-buttons",
      title: "Data Synchronization Controls",
      content: "These sync buttons allow you to manually synchronize data between Tiendanube and your Timeflies app. Sync Products updates your product catalog, Sync Orders brings in new orders, and Sync Checkouts retrieves abandoned cart data. Each sync shows detailed results including added, updated, and deleted items. Use these when you need immediate data updates.",
      target: "[data-testid='sync-buttons']"
    },
    {
      id: "sync-results",
      title: "Synchronization Results",
      content: "After each sync operation, you'll see detailed results showing exactly what changed. Green success messages show totals, additions, updates, and deletions. Yellow warnings indicate errors that occurred during sync. These results help you understand the impact of each sync operation and identify any data inconsistencies that need attention.",
      target: "[data-testid='sync-results']"
    },
    {
      id: "webhooks-section",
      title: "Webhooks Configuration",
      content: "Webhooks enable real-time data synchronization between Tiendanube and your app. Instead of manual syncing, webhooks automatically notify your app when products, orders, or other data changes in your store. This ensures your data is always up-to-date without manual intervention. Configure webhooks here to enable automatic synchronization.",
      target: "[data-testid='webhooks-section']"
    },
    {
      id: "webhook-url-configuration",
      title: "Webhook URL Setup",
      content: "Enter your webhook endpoint URL here. This is where Tiendanube will send real-time notifications when data changes. The URL should point to your server's webhook handler. Once configured, Tiendanube will automatically send updates for product changes, new orders, inventory updates, and other events. This eliminates the need for manual syncing.",
      target: "[data-testid='webhook-url-configuration']"
    },
    {
      id: "webhook-status",
      title: "Webhook System Status",
      content: "This shows the current status of your webhook configuration. Active webhooks are working and receiving real-time updates. Not Configured means no webhooks are set up yet. Error status indicates configuration problems. The status badge shows how many webhook events are currently configured and active.",
      target: "[data-testid='webhook-status']"
    },
    {
      id: "webhook-security",
      title: "Webhook Security Features",
      content: "Your webhook system includes several security features: HMAC-SHA256 verification ensures data integrity, idempotency handling prevents duplicate processing, LGPD compliance protects customer data, and detailed logging helps you monitor webhook activity. These features ensure your webhook integration is secure and reliable.",
      target: "[data-testid='webhook-security']"
    },
    {
      id: "webhook-events",
      title: "Configured Webhook Events",
      content: "When webhooks are active, you'll see a breakdown of configured events: Product Events (product updates, inventory changes), Order Events (new orders, status changes), App Events (app installation/uninstallation), and Other Events (category changes, customer updates). This helps you understand what data is being synchronized automatically.",
      target: "[data-testid='webhook-events']"
    },
    {
      id: "error-handling",
      title: "Error Management & Troubleshooting",
      content: "When connection or sync errors occur, they appear in red error boxes with detailed messages. Each error can be dismissed once resolved. Common issues include API rate limits, authentication failures, network timeouts, and data validation errors. The error messages help you identify and resolve integration problems quickly.",
      target: "[data-testid='error-handling']"
    },
    {
      id: "settings-best-practices",
      title: "Settings Best Practices",
      content: "For optimal performance: Monitor connection status regularly, configure webhooks for automatic sync, run manual syncs during low-traffic periods, review sync results for data quality, and address errors promptly. Regular monitoring ensures your data stays synchronized and your integration remains healthy.",
      target: "[data-testid='settings-best-practices']"
    }
  ]

  const getHelpContent = () => {
    console.log('HelpContext pathname:', pathname)
    if (pathname === "/") {
      return {
        steps: overviewHelpSteps,
        title: "Dashboard Overview Help"
      }
    }
    if (pathname === "/orders") {
      return {
        steps: ordersHelpSteps,
        title: "Orders Page Help"
      }
    }
    if (/^\/orders\/[^/]+$/.test(pathname)) {
      return {
        steps: orderDetailsHelpSteps,
        title: "Order Details Help"
      }
    }
    if (pathname === "/analytics") {
      return {
        steps: analyticsHelpSteps,
        title: "Analytics Page Help"
      }
    }
    if (pathname === "/products") {
      return {
        steps: productsHelpSteps,
        title: "Products Page Help"
      }
    }
    if (/^\/products\/[^/]+$/.test(pathname)) {
      return {
        steps: productDetailsHelpSteps,
        title: "Product Details Help"
      }
    }
    if (pathname === "/customers") {
      return {
        steps: customersHelpSteps,
        title: "Customers Page Help"
      }
    }
    if (pathname === "/settings") {
      return {
        steps: settingsHelpSteps,
        title: "Settings Page Help"
      }
    }
    return {
      steps: [],
      title: "Help"
    }
  }

  const { steps, title } = getHelpContent()

  const openHelp = () => {
    setIsHelpOpen(true)
    setCurrentStep(0)
    // Mark onboarding as seen when user opens help
    if (userId) {
      markOnboardingAsSeen({ user_id: userId })
    }
  }

  const closeHelp = () => {
    setIsHelpOpen(false)
  }

  const value = {
    isHelpOpen,
    openHelp,
    closeHelp,
    currentHelpSteps: steps,
    currentHelpTitle: title,
    currentStep,
    setCurrentStep
  }

  return (
    <HelpContext.Provider value={value}>
      {children}
    </HelpContext.Provider>
  )
}
