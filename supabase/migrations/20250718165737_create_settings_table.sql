create table if not exists settings (id serial primary key, whatsapp_number text); insert into settings (whatsapp_number) values ('+5500000000000') on conflict do nothing;
