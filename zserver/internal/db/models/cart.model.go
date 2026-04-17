package models

import "time"

// Cart represents a user's shopping cart
type Cart struct {
	ID        string     `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	UserID    string     `gorm:"type:uuid;not null;uniqueIndex" json:"user_id"`
	Items     []CartItem `gorm:"foreignKey:CartID;constraint:OnDelete:CASCADE" json:"items,omitempty"`
	CreatedAt time.Time  `gorm:"type:timestamptz;autoCreateTime:milli" json:"created_at"`
	UpdatedAt time.Time  `gorm:"type:timestamptz;autoUpdateTime:milli" json:"updated_at"`
}

// TableName specifies the table name for Cart
func (Cart) TableName() string {
	return "carts"
}

// CartItem represents a single item in a user's cart
type CartItem struct {
	ID           string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	CartID       string    `gorm:"type:uuid;not null;index" json:"cart_id"`
	UserID       string    `gorm:"type:uuid;not null;index:idx_user_cart" json:"user_id"`
	ProductID    string    `gorm:"type:uuid;not null" json:"product_id"`
	ProductName  string    `gorm:"type:varchar(255);not null" json:"product_name"`
	ProductImage string    `gorm:"type:text" json:"product_image"`
	PriceNPR     float64   `gorm:"type:decimal(10,2);not null" json:"price_npr"`
	Quantity     int       `gorm:"not null;default:1" json:"quantity"`
	Color        *string   `gorm:"type:varchar(100)" json:"color,omitempty"`
	CreatedAt    time.Time `gorm:"type:timestamptz;autoCreateTime:milli" json:"created_at"`
	UpdatedAt    time.Time `gorm:"type:timestamptz;autoUpdateTime:milli" json:"updated_at"`
}

// TableName specifies the table name for CartItem
func (CartItem) TableName() string {
	return "cart_items"
}
