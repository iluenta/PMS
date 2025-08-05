create table public.payments (
  id uuid not null default gen_random_uuid (),
  invoice_id uuid null,
  invoice_number character varying(50) null,
  customer_name character varying(255) not null,
  amount numeric(10, 2) not null,
  method character varying(20) not null,
  status character varying(20) not null default 'pending'::character varying,
  date timestamp with time zone not null,
  reference character varying(100) null,
  notes text null,
  fee numeric(10, 2) null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  reservation_id uuid null,
  constraint payments_pkey primary key (id),
  constraint payments_invoice_id_fkey foreign KEY (invoice_id) references invoices (id) on delete set null,
  constraint payments_method_check check (
    (
      (method)::text = any (
        (
          array[
            'credit_card'::character varying,
            'bank_transfer'::character varying,
            'cash'::character varying,
            'paypal'::character varying,
            'check'::character varying,
            'bizum'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint payments_status_check check (
    (
      (status)::text = any (
        (
          array[
            'pending'::character varying,
            'completed'::character varying,
            'failed'::character varying,
            'refunded'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_payments_invoice_id on public.payments using btree (invoice_id) TABLESPACE pg_default;

create index IF not exists idx_payments_status on public.payments using btree (status) TABLESPACE pg_default;

create index IF not exists idx_payments_date on public.payments using btree (date) TABLESPACE pg_default;

create index IF not exists idx_payments_reservation_id on public.payments using btree (reservation_id) TABLESPACE pg_default;

create index IF not exists idx_payments_status_amount on public.payments using btree (status, amount) TABLESPACE pg_default;

create index IF not exists idx_payments_reservation_status on public.payments using btree (reservation_id, status) TABLESPACE pg_default;

create trigger trigger_update_reservation_payment_status_single
after INSERT
or DELETE
or
update on payments for EACH row
execute FUNCTION update_reservation_payment_status ();