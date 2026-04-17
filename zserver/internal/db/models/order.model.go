package models

import "time"

// Order represents an order in the system
type Order struct {
	ID              string      `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	UserID          string      `gorm:"type:uuid;index" json:"user_id"`
	ShippingName    string      `gorm:"type:varchar(255);not null" json:"shipping_name"`
	ShippingPhone   string      `gorm:"type:varchar(20);not null" json:"shipping_phone"`
	ShippingAddress string      `gorm:"type:text;not null" json:"shipping_address"`
	ShippingCity    string      `gorm:"type:varchar(100);not null" json:"shipping_city"`
	TotalAmount     float64     `gorm:"type:decimal(10,2);not null" json:"total_amount"`
	Status          string      `gorm:"type:varchar(50);default:'pending';index" json:"status"`   // pending, confirmed, processing, shipped, delivered, cancelled
	PaymentStatus   string      `gorm:"type:varchar(50);default:'pending'" json:"payment_status"` // pending, paid, failed, refunded
	PaymentMethod   string      `gorm:"type:varchar(100)" json:"payment_method"`
	Notes           *string     `gorm:"type:text" json:"notes"`
	OrderItems      []OrderItem `gorm:"foreignKey:OrderID;constraint:OnDelete:CASCADE" json:"order_items,omitempty"`
	CreatedAt       time.Time   `gorm:"type:timestamptz;autoCreateTime:milli;index" json:"created_at"`
	UpdatedAt       time.Time   `gorm:"type:timestamptz;autoUpdateTime:milli" json:"updated_at"`
}

// TableName specifies the table name for the Order model
func (Order) TableName() string {
	return "orders"
}

// OrderItem represents a single item in an order
type OrderItem struct {
	ID           string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	OrderID      string    `gorm:"type:uuid;not null;index" json:"order_id"`
	ProductID    string    `gorm:"type:uuid" json:"product_id"`
	ProductName  string    `gorm:"type:varchar(255);not null" json:"product_name"`
	ProductImage string    `gorm:"type:text" json:"product_image"`
	Quantity     int       `gorm:"not null" json:"quantity"`
	Price        float64   `gorm:"type:decimal(10,2);not null" json:"price"`
	CreatedAt    time.Time `gorm:"type:timestamptz;autoCreateTime:milli" json:"created_at"`
}

// TableName specifies the table name for OrderItem
func (OrderItem) TableName() string {
	return "order_items"
}

// OrderDTO is the data transfer object for order responses
type OrderDTO struct {
	ID              string         `json:"id"`
	UserID          string         `json:"user_id"`
	ShippingName    string         `json:"shipping_name"`
	ShippingPhone   string         `json:"shipping_phone"`
	ShippingAddress string         `json:"shipping_address"`
	ShippingCity    string         `json:"shipping_city"`
	TotalAmount     float64        `json:"total_amount"`
	Status          string         `json:"status"`
	PaymentStatus   string         `json:"payment_status"`
	PaymentMethod   string         `json:"payment_method"`
	Notes           *string        `json:"notes"`
	OrderItems      []OrderItemDTO `json:"order_items,omitempty"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
}

// OrderItemDTO is the data transfer object for order item responses
type OrderItemDTO struct {
	ID           string    `json:"id"`
	OrderID      string    `json:"order_id"`
	ProductID    string    `json:"product_id"`
	ProductName  string    `json:"product_name"`
	ProductImage string    `json:"product_image"`
	Quantity     int       `json:"quantity"`
	Price        float64   `json:"price"`
	CreatedAt    time.Time `json:"created_at"`
}

// ToDTO converts an Order model to OrderDTO
func (o *Order) ToDTO() OrderDTO {
	orderItemDTOs := make([]OrderItemDTO, len(o.OrderItems))
	for i, item := range o.OrderItems {
		orderItemDTOs[i] = item.ToDTO()
	}
	return OrderDTO{
		ID:              o.ID,
		UserID:          o.UserID,
		ShippingName:    o.ShippingName,
		ShippingPhone:   o.ShippingPhone,
		ShippingAddress: o.ShippingAddress,
		ShippingCity:    o.ShippingCity,
		TotalAmount:     o.TotalAmount,
		Status:          o.Status,
		PaymentStatus:   o.PaymentStatus,
		PaymentMethod:   o.PaymentMethod,
		Notes:           o.Notes,
		OrderItems:      orderItemDTOs,
		CreatedAt:       o.CreatedAt,
		UpdatedAt:       o.UpdatedAt,
	}
}

// ToDTO converts an OrderItem model to OrderItemDTO
func (oi *OrderItem) ToDTO() OrderItemDTO {
	return OrderItemDTO{
		ID:           oi.ID,
		OrderID:      oi.OrderID,
		ProductID:    oi.ProductID,
		ProductName:  oi.ProductName,
		ProductImage: oi.ProductImage,
		Quantity:     oi.Quantity,
		Price:        oi.Price,
		CreatedAt:    oi.CreatedAt,
	}
}
