package analytics

import (
	"ecom/go/internal/db"
	"fmt"
	"strings"
	"time"

	"gorm.io/gorm"
)

// Repository handles analytics database operations.
type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new analytics repository.
func NewRepository() *Repository {
	return &Repository{db: db.GetDB()}
}

// GetOverview retrieves top-level analytics KPIs.
func (r *Repository) GetOverview() (*Overview, error) {
	overview := &Overview{}

	if err := r.db.Table("orders").
		Select(
			"COUNT(*) as total_orders",
			"COALESCE(SUM(total_amount), 0) as total_income",
			"COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as paid_income",
			"COALESCE(SUM(CASE WHEN payment_status = 'pending' THEN total_amount ELSE 0 END), 0) as pending_income",
			"COALESCE(SUM(CASE WHEN LOWER(COALESCE(payment_method, '')) = 'cod' THEN total_amount ELSE 0 END), 0) as cod_income",
			"COALESCE(SUM(CASE WHEN LOWER(COALESCE(payment_method, '')) <> 'cod' THEN total_amount ELSE 0 END), 0) as other_income",
			"COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as total_customers",
		).
		Scan(overview).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch analytics overview: %w", err)
	}

	if overview.TotalOrders > 0 {
		overview.AverageOrderValue = overview.TotalIncome / float64(overview.TotalOrders)
	}

	if err := r.db.Table("order_items").
		Select("COALESCE(SUM(quantity), 0)").
		Scan(&overview.TotalItemsSold).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch items sold: %w", err)
	}

	return overview, nil
}

// GetMonthlySales retrieves monthly order and income trends.
func (r *Repository) GetMonthlySales(months int) ([]MonthlySalesPoint, error) {
	type monthlyRow struct {
		MonthStart  time.Time `gorm:"column:month_start"`
		TotalOrders int64     `gorm:"column:total_orders"`
		TotalIncome float64   `gorm:"column:total_income"`
		CODIncome   float64   `gorm:"column:cod_income"`
		OtherIncome float64   `gorm:"column:other_income"`
	}

	now := time.Now()
	startMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC).AddDate(0, -(months - 1), 0)

	var rows []monthlyRow
	if err := r.db.Table("orders").
		Select(
			"DATE_TRUNC('month', created_at) as month_start",
			"COUNT(*) as total_orders",
			"COALESCE(SUM(total_amount), 0) as total_income",
			"COALESCE(SUM(CASE WHEN LOWER(COALESCE(payment_method, '')) = 'cod' THEN total_amount ELSE 0 END), 0) as cod_income",
			"COALESCE(SUM(CASE WHEN LOWER(COALESCE(payment_method, '')) <> 'cod' THEN total_amount ELSE 0 END), 0) as other_income",
		).
		Where("created_at >= ?", startMonth).
		Group("DATE_TRUNC('month', created_at)").
		Order("month_start ASC").
		Scan(&rows).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch monthly sales: %w", err)
	}

	rowMap := make(map[string]monthlyRow, len(rows))
	for _, row := range rows {
		key := row.MonthStart.UTC().Format("2006-01")
		rowMap[key] = row
	}

	result := make([]MonthlySalesPoint, 0, months)
	for i := 0; i < months; i++ {
		current := startMonth.AddDate(0, i, 0)
		key := current.Format("2006-01")
		point := MonthlySalesPoint{
			Month:      key,
			MonthLabel: current.Format("Jan 2006"),
		}

		if row, ok := rowMap[key]; ok {
			point.TotalOrders = row.TotalOrders
			point.TotalIncome = row.TotalIncome
			point.CODIncome = row.CODIncome
			point.OtherIncome = row.OtherIncome
		}

		result = append(result, point)
	}

	return result, nil
}

// GetPaymentIncomeBreakdown retrieves income split by payment method.
func (r *Repository) GetPaymentIncomeBreakdown() ([]PaymentIncomeBreakdown, error) {
	type row struct {
		PaymentMethod string  `gorm:"column:payment_method"`
		TotalOrders   int64   `gorm:"column:total_orders"`
		TotalIncome   float64 `gorm:"column:total_income"`
	}

	var rows []row
	if err := r.db.Table("orders").
		Select(
			"COALESCE(NULLIF(payment_method, ''), 'unknown') as payment_method",
			"COUNT(*) as total_orders",
			"COALESCE(SUM(total_amount), 0) as total_income",
		).
		Group("COALESCE(NULLIF(payment_method, ''), 'unknown')").
		Order("total_income DESC").
		Scan(&rows).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch payment income breakdown: %w", err)
	}

	result := make([]PaymentIncomeBreakdown, 0, len(rows))
	for _, row := range rows {
		result = append(result, PaymentIncomeBreakdown{
			PaymentMethod: strings.ToLower(row.PaymentMethod),
			TotalOrders:   row.TotalOrders,
			TotalIncome:   row.TotalIncome,
		})
	}

	return result, nil
}

// GetTopProducts retrieves top products by income.
func (r *Repository) GetTopProducts(limit int) ([]TopProduct, error) {
	query := r.db.Table("order_items oi").
		Select(
			"oi.product_name as product_name",
			"COALESCE(SUM(oi.quantity), 0) as quantity_sold",
			"COALESCE(SUM(oi.quantity * oi.price), 0) as total_income",
			"COUNT(DISTINCT oi.order_id) as orders_count",
		).
		Group("oi.product_name").
		Order("total_income DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	var products []TopProduct
	if err := query.Scan(&products).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch top products: %w", err)
	}

	return products, nil
}

// GetOrderStatusBreakdown retrieves order counts by status.
func (r *Repository) GetOrderStatusBreakdown() (map[string]int64, error) {
	type row struct {
		Status string `gorm:"column:status"`
		Count  int64  `gorm:"column:count"`
	}

	var rows []row
	if err := r.db.Table("orders").
		Select("status, COUNT(*) as count").
		Group("status").
		Scan(&rows).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch order status breakdown: %w", err)
	}

	result := map[string]int64{}
	for _, row := range rows {
		result[row.Status] = row.Count
	}

	return result, nil
}

// GetPaymentStatusBreakdown retrieves order counts by payment status.
func (r *Repository) GetPaymentStatusBreakdown() (map[string]int64, error) {
	type row struct {
		Status string `gorm:"column:payment_status"`
		Count  int64  `gorm:"column:count"`
	}

	var rows []row
	if err := r.db.Table("orders").
		Select("payment_status, COUNT(*) as count").
		Group("payment_status").
		Scan(&rows).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch payment status breakdown: %w", err)
	}

	result := map[string]int64{}
	for _, row := range rows {
		result[row.Status] = row.Count
	}

	return result, nil
}
