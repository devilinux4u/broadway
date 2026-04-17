package dashboard

import (
	"fmt"
)

// Service handles business logic for dashboard
type Service struct {
	repo *Repository
}

// NewService creates a new dashboard service
func NewService(repo *Repository) *Service {
	return &Service{
		repo: repo,
	}
}

// GetDashboardData retrieves complete dashboard data
func (s *Service) GetDashboardData() (*DashboardResponse, error) {
	// Get all stats in parallel by fetching them sequentially
	stats, err := s.repo.GetDashboardStats()
	if err != nil {
		return nil, fmt.Errorf("failed to get dashboard stats: %w", err)
	}

	// Get recent orders
	recentOrders, err := s.repo.GetRecentOrders(5)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent orders: %w", err)
	}

	// Get low stock items
	lowStockItems, err := s.repo.GetLowStockProducts()
	if err != nil {
		return nil, fmt.Errorf("failed to get low stock products: %w", err)
	}

	// If no low stock items, return empty slice instead of nil
	if lowStockItems == nil {
		lowStockItems = []LowStockProduct{}
	}
	if recentOrders == nil {
		recentOrders = []RecentOrder{}
	}

	return &DashboardResponse{
		Stats:         *stats,
		RecentOrders:  recentOrders,
		LowStockItems: lowStockItems,
	}, nil
}

// GetOrderStats retrieves order statistics
func (s *Service) GetOrderStats() (*OrderBreakdown, error) {
	breakdown, err := s.repo.GetOrderBreakdown()
	if err != nil {
		return nil, fmt.Errorf("failed to get order breakdown: %w", err)
	}
	return breakdown, nil
}

// GetInventoryStats retrieves inventory statistics
func (s *Service) GetInventoryStats() (*InventorySummary, error) {
	summary, err := s.repo.GetInventorySummary()
	if err != nil {
		return nil, fmt.Errorf("failed to get inventory summary: %w", err)
	}
	return summary, nil
}

// GetRevenueData retrieves revenue statistics
func (s *Service) GetRevenueData() (*RevenueStats, error) {
	stats, err := s.repo.GetRevenueStats()
	if err != nil {
		return nil, fmt.Errorf("failed to get revenue stats: %w", err)
	}
	return stats, nil
}

// GetRecentOrdersList retrieves a list of recent orders
func (s *Service) GetRecentOrdersList(limit int) ([]RecentOrder, error) {
	if limit <= 0 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	orders, err := s.repo.GetRecentOrders(limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent orders: %w", err)
	}

	if orders == nil {
		return []RecentOrder{}, nil
	}
	return orders, nil
}

// GetLowStockItems retrieves products with low stock
func (s *Service) GetLowStockItems() ([]LowStockProduct, error) {
	products, err := s.repo.GetLowStockProducts()
	if err != nil {
		return nil, fmt.Errorf("failed to get low stock products: %w", err)
	}

	if products == nil {
		return []LowStockProduct{}, nil
	}
	return products, nil
}
