-- Add VAT configuration to property_channels
alter table property_channels
  add column if not exists apply_vat boolean not null default true,
  add column if not exists vat_percent numeric(5,2) not null default 21.00;

-- Initialize any nulls (safety)
update property_channels
  set apply_vat = coalesce(apply_vat, true),
      vat_percent = coalesce(vat_percent, 21.00);
