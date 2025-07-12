import { useState, useMemo } from "react";
import { OrderFilters } from "@/components/orders-filters";

export interface OrderWithDetails {
  _id: string;
  provider_order_id: string;
  state: string;
  tiendanube_details?: {
    contact_name?: string;
    contact_email?: string;
    total?: string;
    currency?: string;
    payment_status?: string;
    created_at?: string;
    products?: string;
  } | null;
}

export function useOrdersFilters(orders: OrderWithDetails[] | undefined) {
  const [filters, setFilters] = useState<OrderFilters>({
    searchTerm: "",
    dateFrom: "",
    dateTo: "",
    status: "",
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const filteredAndSortedOrders = useMemo(() => {
    if (!orders) return [];

    let filtered = [...orders];

    // Filtro por término de búsqueda
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter((order) => {
        const name = order.tiendanube_details?.contact_name?.toLowerCase() || "";
        const email = order.tiendanube_details?.contact_email?.toLowerCase() || "";
        const orderId = order.provider_order_id.toLowerCase();

        return name.includes(searchLower) ||
               email.includes(searchLower) ||
               orderId.includes(searchLower);
      });
    }

    // Filtro por estado
    if (filters.status) {
      filtered = filtered.filter((order) => order.state === filters.status);
    }

    // Filtro por fecha
    if (filters.dateFrom) {
      filtered = filtered.filter((order) => {
        const orderDate = order.tiendanube_details?.created_at;
        if (!orderDate) return false;
        return new Date(orderDate) >= new Date(filters.dateFrom);
      });
    }

    if (filters.dateTo) {
      filtered = filtered.filter((order) => {
        const orderDate = order.tiendanube_details?.created_at;
        if (!orderDate) return false;
        return new Date(orderDate) <= new Date(filters.dateTo);
      });
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (filters.sortBy) {
        case "created_at":
          aValue = a.tiendanube_details?.created_at || "";
          bValue = b.tiendanube_details?.created_at || "";
          break;
        case "contact_name":
          aValue = a.tiendanube_details?.contact_name || "";
          bValue = b.tiendanube_details?.contact_name || "";
          break;
        case "total":
          aValue = parseFloat(a.tiendanube_details?.total || "0");
          bValue = parseFloat(b.tiendanube_details?.total || "0");
          break;
        case "provider_order_id":
          aValue = parseInt(a.provider_order_id) || 0;
          bValue = parseInt(b.provider_order_id) || 0;
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [orders, filters]);

  return {
    filters,
    setFilters,
    filteredOrders: filteredAndSortedOrders,
    totalOrders: orders?.length || 0,
    filteredCount: filteredAndSortedOrders.length,
  };
}
