package analytics

import "fmt"

// Service handles analytics business logic.
type Service struct {
	repo *Repository
}

// NewService creates a new analytics service.
func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// GetFullAnalytics returns complete analytics payload for admin dashboard.
func (s *Service) GetFullAnalytics(months, topProductsLimit int) (*FullAnalyticsResponse, error) {
	overview, err := s.repo.GetOverview()
	if err != nil {
		return nil, fmt.Errorf("failed to get overview: %w", err)
	}

	monthlySales, err := s.GetMonthlySales(months)
	if err != nil {
		return nil, fmt.Errorf("failed to get monthly sales: %w", err)
	}

	paymentIncome, err := s.repo.GetPaymentIncomeBreakdown()
	if err != nil {
		return nil, fmt.Errorf("failed to get payment income: %w", err)
	}

	topProducts, err := s.GetTopProducts(topProductsLimit)
	if err != nil {
		return nil, fmt.Errorf("failed to get top products: %w", err)
	}

	orderStatus, err := s.repo.GetOrderStatusBreakdown()
	if err != nil {
		return nil, fmt.Errorf("failed to get order status breakdown: %w", err)
	}

	paymentStatus, err := s.repo.GetPaymentStatusBreakdown()
	if err != nil {
		return nil, fmt.Errorf("failed to get payment status breakdown: %w", err)
	}

	return &FullAnalyticsResponse{
		Overview:               *overview,
		MonthlySales:           monthlySales,
		PaymentIncome:          paymentIncome,
		TopProducts:            topProducts,
		OrderStatusBreakdown:   orderStatus,
		PaymentStatusBreakdown: paymentStatus,
	}, nil
}

// GetMonthlySales returns monthly trends with sensible bounds.
func (s *Service) GetMonthlySales(months int) ([]MonthlySalesPoint, error) {
	if months <= 0 {
		months = 12
	}
	if months > 36 {
		months = 36
	}

	rows, err := s.repo.GetMonthlySales(months)
	if err != nil {
		return nil, err
	}

	if rows == nil {
		return []MonthlySalesPoint{}, nil
	}

	return rows, nil
}

// GetTopProducts returns top products with sensible bounds.
func (s *Service) GetTopProducts(limit int) ([]TopProduct, error) {
	if limit <= 0 {
		limit = 10
	}
	if limit > 50 {
		limit = 50
	}

	products, err := s.repo.GetTopProducts(limit)
	if err != nil {
		return nil, err
	}

	if products == nil {
		return []TopProduct{}, nil
	}

	return products, nil
}

// GetOverview returns top-level analytics KPIs.
func (s *Service) GetOverview() (*Overview, error) {
	return s.repo.GetOverview()
}

// GetPaymentIncomeBreakdown returns payment-method income split.
func (s *Service) GetPaymentIncomeBreakdown() ([]PaymentIncomeBreakdown, error) {
	rows, err := s.repo.GetPaymentIncomeBreakdown()
	if err != nil {
		return nil, err
	}

	if rows == nil {
		return []PaymentIncomeBreakdown{}, nil
	}

	return rows, nil
}
