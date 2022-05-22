-- Database generated with pgModeler (PostgreSQL Database Modeler).
-- pgModeler version: 1.0.0-alpha
-- PostgreSQL version: 14.0
-- Project Site: pgmodeler.io
-- Model Author: Jedson Gabriel

-- object: public."Client" | type: TABLE --
-- DROP TABLE IF EXISTS public."Client" CASCADE;
CREATE TABLE public."Client" (
	id uuid NOT NULL,
	name text NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	cpf text NOT NULL,
	active boolean NOT NULL DEFAULT true,
	CONSTRAINT "User_pk" PRIMARY KEY (id),
	CONSTRAINT "cpf_Unique" UNIQUE (cpf)
);
-- ddl-end --
ALTER TABLE public."Client" OWNER TO adm;
-- ddl-end --

-- object: public."Phone" | type: TABLE --
-- DROP TABLE IF EXISTS public."Phone" CASCADE;
CREATE TABLE public."Phone" (
	id serial NOT NULL,
	"DDD" text,
	"DDI" text,
	number text NOT NULL,
	"primary" boolean,
	"id_PhoneType" integer,
	"id_Client" uuid,
	CONSTRAINT "Phone_pk" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."Phone" OWNER TO adm;
-- ddl-end --

-- object: public."Email" | type: TABLE --
-- DROP TABLE IF EXISTS public."Email" CASCADE;
CREATE TABLE public."Email" (
	id serial NOT NULL,
	address text NOT NULL,
	"primary" boolean,
	"id_Client" uuid,
	CONSTRAINT "Email_pk" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."Email" OWNER TO adm;
-- ddl-end --

-- object: public."WorkOrder" | type: TABLE --
-- DROP TABLE IF EXISTS public."WorkOrder" CASCADE;
CREATE TABLE public."WorkOrder" (
	id uuid NOT NULL,
	obs text,
	"id_Client" uuid,
	"id_WorkOrderStatus" integer NOT NULL,
	CONSTRAINT "WorkOrder_pk" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."WorkOrder" OWNER TO adm;
-- ddl-end --

-- object: public."Task" | type: TABLE --
-- DROP TABLE IF EXISTS public."Task" CASCADE;
CREATE TABLE public."Task" (
	id serial NOT NULL,
	description text,
	"timeCost" integer,
	"materialCost" money,
	"id_Device" integer NOT NULL,
	"id_WorkOrder" uuid NOT NULL,
	CONSTRAINT "WorkOrderTask_pk" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."Task" OWNER TO adm;
-- ddl-end --

-- object: public."Device" | type: TABLE --
-- DROP TABLE IF EXISTS public."Device" CASCADE;
CREATE TABLE public."Device" (
	id serial NOT NULL,
	brand text NOT NULL,
	model text NOT NULL,
	description text,
	sku text,
	"photoURL" text,
	CONSTRAINT device_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."Device" OWNER TO adm;
-- ddl-end --

-- object: "Device_fk" | type: CONSTRAINT --
-- ALTER TABLE public."Task" DROP CONSTRAINT IF EXISTS "Device_fk" CASCADE;
ALTER TABLE public."Task" ADD CONSTRAINT "Device_fk" FOREIGN KEY ("id_Device")
REFERENCES public."Device" (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: public."PhoneType" | type: TABLE --
-- DROP TABLE IF EXISTS public."PhoneType" CASCADE;
CREATE TABLE public."PhoneType" (
	id serial NOT NULL,
	description text NOT NULL,
	CONSTRAINT "PhoneType_pk" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."PhoneType" OWNER TO adm;
-- ddl-end --

-- object: "PhoneType_fk" | type: CONSTRAINT --
-- ALTER TABLE public."Phone" DROP CONSTRAINT IF EXISTS "PhoneType_fk" CASCADE;
ALTER TABLE public."Phone" ADD CONSTRAINT "PhoneType_fk" FOREIGN KEY ("id_PhoneType")
REFERENCES public."PhoneType" (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: "WorkOrder_fk" | type: CONSTRAINT --
-- ALTER TABLE public."Task" DROP CONSTRAINT IF EXISTS "WorkOrder_fk" CASCADE;
ALTER TABLE public."Task" ADD CONSTRAINT "WorkOrder_fk" FOREIGN KEY ("id_WorkOrder")
REFERENCES public."WorkOrder" (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: public."Service" | type: TABLE --
-- DROP TABLE IF EXISTS public."Service" CASCADE;
CREATE TABLE public."Service" (
	id serial NOT NULL,
	description text NOT NULL,
	"estimatedTimeCost" integer,
	"estimatedMaterialCost" money,
	CONSTRAINT "Service_pk" PRIMARY KEY (id)
);
-- ddl-end --
COMMENT ON COLUMN public."Service"."estimatedTimeCost" IS E'Time estimated, in hours, to complete the service.';
-- ddl-end --
COMMENT ON COLUMN public."Service"."estimatedMaterialCost" IS E'Cost in materials to complete the service.';
-- ddl-end --
ALTER TABLE public."Service" OWNER TO adm;
-- ddl-end --

-- object: "Client_fk" | type: CONSTRAINT --
-- ALTER TABLE public."WorkOrder" DROP CONSTRAINT IF EXISTS "Client_fk" CASCADE;
ALTER TABLE public."WorkOrder" ADD CONSTRAINT "Client_fk" FOREIGN KEY ("id_Client")
REFERENCES public."Client" (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: public."WorkOrderStatus" | type: TABLE --
-- DROP TABLE IF EXISTS public."WorkOrderStatus" CASCADE;
CREATE TABLE public."WorkOrderStatus" (
	id serial NOT NULL,
	description text NOT NULL,
	CONSTRAINT "WorkOrderStatus_pk" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."WorkOrderStatus" OWNER TO adm;
-- ddl-end --

-- object: "WorkOrderStatus_fk" | type: CONSTRAINT --
-- ALTER TABLE public."WorkOrder" DROP CONSTRAINT IF EXISTS "WorkOrderStatus_fk" CASCADE;
ALTER TABLE public."WorkOrder" ADD CONSTRAINT "WorkOrderStatus_fk" FOREIGN KEY ("id_WorkOrderStatus")
REFERENCES public."WorkOrderStatus" (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: "Client_fk" | type: CONSTRAINT --
-- ALTER TABLE public."Phone" DROP CONSTRAINT IF EXISTS "Client_fk" CASCADE;
ALTER TABLE public."Phone" ADD CONSTRAINT "Client_fk" FOREIGN KEY ("id_Client")
REFERENCES public."Client" (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: "Client_fk" | type: CONSTRAINT --
-- ALTER TABLE public."Email" DROP CONSTRAINT IF EXISTS "Client_fk" CASCADE;
ALTER TABLE public."Email" ADD CONSTRAINT "Client_fk" FOREIGN KEY ("id_Client")
REFERENCES public."Client" (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: public."Task_Service" | type: TABLE --
-- DROP TABLE IF EXISTS public."Task_Service" CASCADE;
CREATE TABLE public."Task_Service" (
	id serial NOT NULL,
	"id_Task" integer NOT NULL,
	"id_Service" integer NOT NULL,
	CONSTRAINT "Task_Service_pk" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."Task_Service" OWNER TO adm;
-- ddl-end --

-- object: "Task_fk" | type: CONSTRAINT --
-- ALTER TABLE public."Task_Service" DROP CONSTRAINT IF EXISTS "Task_fk" CASCADE;
ALTER TABLE public."Task_Service" ADD CONSTRAINT "Task_fk" FOREIGN KEY ("id_Task")
REFERENCES public."Task" (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: "Service_fk" | type: CONSTRAINT --
-- ALTER TABLE public."Task_Service" DROP CONSTRAINT IF EXISTS "Service_fk" CASCADE;
ALTER TABLE public."Task_Service" ADD CONSTRAINT "Service_fk" FOREIGN KEY ("id_Service")
REFERENCES public."Service" (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --


-- Appended SQL commands --

INSERT INTO public."PhoneType" ("description") VALUES ('Celular'), ('Telefone Fixo');

INSERT INTO public."Client" ("id", "firstName", "lastName", "name", "cpf") VALUES ('12f31849-4cc0-4588-9620-76592a8bb908', 'Miguel', 'Oliveira Alves', 'Miguel Oliveira Alves', '321.222.333-78');

INSERT INTO public."Device" ("model", "brand", "description", "sku", "photoURL") VALUES
('12', 'iPhone', 'Celular de Rico', 'SK1111111111', 'https://a-static.mlcdn.com.br/618x463/iphone-12-pro-max-apple-128gb-azul-pacifico-67-cam-tripla-12mp-ios/magazineluiza/155596200/a69733d827ba8cfd5e3ba7bb572765c1.jpg'),
('Mi Note 10 Lite', 'Xiaomi', 'Celular de Pobre', 'SK6546455641561', 'https://http2.mlstatic.com/D_NQ_NP_874706-MLA43195094458_082020-O.jpg'),
('7', 'iPhone', 'Twitter for iPhone', 'SKK5555555555', 'https://a-static.mlcdn.com.br/1500x1500/iphone-7-apple-32gb-preto-47-12mp-ios/magazineluiza/218009200/235e4ca66f67b86e161bb326bf805911.jpg');

INSERT INTO public."Service" ("description", "estimatedMaterialCost", "estimatedTimeCost") VALUES
('Troca de Tela', 150.00, 60),
('Troca de Baterias', 200.00, 60),
('Restaurações de Software', 30.50, 60),
('Auto Falante e Microfone', 170.95, 60),
('Troca de Conectores', 100.11, 60),
('Reparo na Placa Principal', 500.23, 60),
('Troca de Flex Cable', 50.87 , 60);

INSERT INTO public."WorkOrderStatus" ("description") VALUES ('Em aprovação'), ('Em andamento'), ('Finalizado');

-- ddl-end --