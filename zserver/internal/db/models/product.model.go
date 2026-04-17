package models

import "time"

// Product represents a product in the inventory
type Product struct {
	ID                string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Name              string    `gorm:"type:varchar(255);not null" json:"name"`
	Description       *string   `gorm:"type:text" json:"description"`
	Category          string    `gorm:"type:varchar(100);index" json:"category"`
	PriceNPR          float64   `gorm:"type:decimal(10,2);not null" json:"price_npr"`
	ImageURL          *string   `gorm:"type:text" json:"image_url"`
	Badge             *string   `gorm:"type:varchar(100)" json:"badge"`
	Featured          bool      `gorm:"default:false;index" json:"featured"`
	NewArrival        bool      `gorm:"default:false;index" json:"new_arrival"`
	InStock           bool      `gorm:"default:true" json:"in_stock"`
	StockQuantity     int       `gorm:"default:0" json:"stock_quantity"`
	LowStockThreshold int       `gorm:"default:5" json:"low_stock_threshold"`
	CreatedAt         time.Time `gorm:"type:timestamptz;autoCreateTime:milli" json:"created_at"`
	UpdatedAt         time.Time `gorm:"type:timestamptz;autoUpdateTime:milli" json:"updated_at"`
}

// TableName specifies the table name for the Product model
func (Product) TableName() string {
	return "products"
}

// ProductDTO is the data transfer object for product responses
type ProductDTO struct {
	ID                string  `json:"id"`
	Name              string  `json:"name"`
	Description       *string `json:"description"`
	Category          string  `json:"category"`
	PriceNPR          float64 `json:"price_npr"`
	ImageURL          *string `json:"image_url"`
	Badge             *string `json:"badge"`
	Featured          bool    `json:"featured"`
	NewArrival        bool    `json:"new_arrival"`
	InStock           bool    `json:"in_stock"`
	StockQuantity     int     `json:"stock_quantity"`
	LowStockThreshold int     `json:"low_stock_threshold"`
}

// ToDTO converts a Product model to ProductDTO
func (p *Product) ToDTO() ProductDTO {
	return ProductDTO{
		ID:                p.ID,
		Name:              p.Name,
		Description:       p.Description,
		Category:          p.Category,
		PriceNPR:          p.PriceNPR,
		ImageURL:          p.ImageURL,
		Badge:             p.Badge,
		Featured:          p.Featured,
		NewArrival:        p.NewArrival,
		InStock:           p.InStock,
		StockQuantity:     p.StockQuantity,
		LowStockThreshold: p.LowStockThreshold,
	}
}

// ProductImage represents additional product images
type ProductImage struct {
	ID        string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	ProductID string    `gorm:"type:uuid;not null;index" json:"product_id"`
	ImageURL  string    `gorm:"type:text;not null" json:"image_url"`
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	CreatedAt time.Time `gorm:"type:timestamptz;autoCreateTime:milli" json:"created_at"`
}

// TableName specifies the table name for ProductImage
func (ProductImage) TableName() string {
	return "product_images"
}

// ProductColor represents product color variants
type ProductColor struct {
	ID        string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	ProductID string    `gorm:"type:uuid;not null;index" json:"product_id"`
	Name      string    `gorm:"type:varchar(100);not null" json:"name"`
	Value     string    `gorm:"type:varchar(50);not null" json:"value"`
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	CreatedAt time.Time `gorm:"type:timestamptz;autoCreateTime:milli" json:"created_at"`
}

// TableName specifies the table name for ProductColor
func (ProductColor) TableName() string {
	return "product_colors"
}

// StockMovement represents stock in/out movements
type StockMovement struct {
	ID        string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	ProductID string    `gorm:"type:uuid;not null;index" json:"product_id"`
	Type      string    `gorm:"type:varchar(10);not null" json:"type"` // 'in' or 'out'
	Quantity  int       `gorm:"not null" json:"quantity"`
	Reason    *string   `gorm:"type:text" json:"reason"`
	CreatedBy string    `gorm:"type:uuid" json:"created_by"`
	CreatedAt time.Time `gorm:"type:timestamptz;autoCreateTime:milli" json:"created_at"`
}

// TableName specifies the table name for StockMovement
func (StockMovement) TableName() string {
	return "stock_movements"
}
