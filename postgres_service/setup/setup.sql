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
	cpf text,
	active boolean NOT NULL DEFAULT true,
	CONSTRAINT "User_pk" PRIMARY KEY (id)
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
	"id_Client" uuid,
	"id_WorkOrderStatus" integer,
	CONSTRAINT "WorkOrder_pk" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."WorkOrder" OWNER TO adm;
-- ddl-end --

-- object: public."Task" | type: TABLE --
-- DROP TABLE IF EXISTS public."Task" CASCADE;
CREATE TABLE public."Task" (
	id serial NOT NULL,
	description text NOT NULL,
	"timeCost" integer,
	"materialCost" money,
	id_device integer,
	"id_WorkOrder" uuid,
	"id_Service" integer,
	CONSTRAINT "WorkOrderTask_pk" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."Task" OWNER TO adm;
-- ddl-end --

-- object: public.device | type: TABLE --
-- DROP TABLE IF EXISTS public.device CASCADE;
CREATE TABLE public.device (
	id serial NOT NULL,
	brand text NOT NULL,
	model text NOT NULL,
	description text,
	sku text,
	"photoURL" text,
	CONSTRAINT device_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.device OWNER TO adm;
-- ddl-end --

-- object: device_fk | type: CONSTRAINT --
-- ALTER TABLE public."Task" DROP CONSTRAINT IF EXISTS device_fk CASCADE;
ALTER TABLE public."Task" ADD CONSTRAINT device_fk FOREIGN KEY (id_device)
REFERENCES public.device (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
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
ON DELETE SET NULL ON UPDATE CASCADE;
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

-- object: "Service_fk" | type: CONSTRAINT --
-- ALTER TABLE public."Task" DROP CONSTRAINT IF EXISTS "Service_fk" CASCADE;
ALTER TABLE public."Task" ADD CONSTRAINT "Service_fk" FOREIGN KEY ("id_Service")
REFERENCES public."Service" (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
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
ON DELETE SET NULL ON UPDATE CASCADE;
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


INSERT INTO "PhoneType" (description) VALUES ('Celular'), ('Telefone Fixo');
