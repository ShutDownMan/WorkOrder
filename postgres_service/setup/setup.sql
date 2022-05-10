-- Database generated with pgModeler (PostgreSQL Database Modeler).
-- pgModeler version: 1.0.0-alpha
-- PostgreSQL version: 14.0
-- Project Site: pgmodeler.io
-- Model Author: Jedson Gabriel

-- object: public."User" | type: TABLE --
-- DROP TABLE IF EXISTS public."User" CASCADE;
CREATE TABLE public."User" (
	id serial NOT NULL,
	name text NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	cpf text,
	CONSTRAINT "User_pk" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."User" OWNER TO postgres;
-- ddl-end --

-- object: public."Phone" | type: TABLE --
-- DROP TABLE IF EXISTS public."Phone" CASCADE;
CREATE TABLE public."Phone" (
	id serial NOT NULL,
	"DDD" text,
	"DDI" text,
	number text,
	"id_PhoneType" integer,
	CONSTRAINT "Phone_pk" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."Phone" OWNER TO postgres;
-- ddl-end --

-- object: public."Email" | type: TABLE --
-- DROP TABLE IF EXISTS public."Email" CASCADE;
CREATE TABLE public."Email" (
	id serial NOT NULL,
	address text NOT NULL,
	CONSTRAINT "Email_pk" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."Email" OWNER TO postgres;
-- ddl-end --

-- object: public."WorkOrder" | type: TABLE --
-- DROP TABLE IF EXISTS public."WorkOrder" CASCADE;
CREATE TABLE public."WorkOrder" (
	id serial NOT NULL,
	CONSTRAINT "WorkOrder_pk" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."WorkOrder" OWNER TO postgres;
-- ddl-end --

-- object: public."Task" | type: TABLE --
-- DROP TABLE IF EXISTS public."Task" CASCADE;
CREATE TABLE public."Task" (
	id serial NOT NULL,
	description text NOT NULL,
	"timeCost" integer,
	"materialCost" money,
	id_device integer,
	"id_WorkOrder" integer,
	"id_Service" integer,
	CONSTRAINT "WorkOrderTask_pk" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."Task" OWNER TO postgres;
-- ddl-end --

-- object: public.device | type: TABLE --
-- DROP TABLE IF EXISTS public.device CASCADE;
CREATE TABLE public.device (
	id serial NOT NULL,
	model text,
	description text,
	"SKU" text,
	CONSTRAINT device_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.device OWNER TO postgres;
-- ddl-end --

-- object: public."User_WorkOrder" | type: TABLE --
-- DROP TABLE IF EXISTS public."User_WorkOrder" CASCADE;
CREATE TABLE public."User_WorkOrder" (
	id serial NOT NULL,
	"id_User" integer,
	"id_WorkOrder" integer,
	CONSTRAINT "User_WorkOrder_pk" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."User_WorkOrder" OWNER TO postgres;
-- ddl-end --

-- object: "User_fk" | type: CONSTRAINT --
-- ALTER TABLE public."User_WorkOrder" DROP CONSTRAINT IF EXISTS "User_fk" CASCADE;
ALTER TABLE public."User_WorkOrder" ADD CONSTRAINT "User_fk" FOREIGN KEY ("id_User")
REFERENCES public."User" (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: "WorkOrder_fk" | type: CONSTRAINT --
-- ALTER TABLE public."User_WorkOrder" DROP CONSTRAINT IF EXISTS "WorkOrder_fk" CASCADE;
ALTER TABLE public."User_WorkOrder" ADD CONSTRAINT "WorkOrder_fk" FOREIGN KEY ("id_WorkOrder")
REFERENCES public."WorkOrder" (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
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
ALTER TABLE public."PhoneType" OWNER TO postgres;
-- ddl-end --

-- object: "PhoneType_fk" | type: CONSTRAINT --
-- ALTER TABLE public."Phone" DROP CONSTRAINT IF EXISTS "PhoneType_fk" CASCADE;
ALTER TABLE public."Phone" ADD CONSTRAINT "PhoneType_fk" FOREIGN KEY ("id_PhoneType")
REFERENCES public."PhoneType" (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: public."User_Phone" | type: TABLE --
-- DROP TABLE IF EXISTS public."User_Phone" CASCADE;
CREATE TABLE public."User_Phone" (
	id serial NOT NULL,
	"primary" boolean NOT NULL DEFAULT false,
	"id_User" integer,
	"id_Phone" integer,
	CONSTRAINT "User_Phone_pk" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."User_Phone" OWNER TO postgres;
-- ddl-end --

-- object: "User_fk" | type: CONSTRAINT --
-- ALTER TABLE public."User_Phone" DROP CONSTRAINT IF EXISTS "User_fk" CASCADE;
ALTER TABLE public."User_Phone" ADD CONSTRAINT "User_fk" FOREIGN KEY ("id_User")
REFERENCES public."User" (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: "Phone_fk" | type: CONSTRAINT --
-- ALTER TABLE public."User_Phone" DROP CONSTRAINT IF EXISTS "Phone_fk" CASCADE;
ALTER TABLE public."User_Phone" ADD CONSTRAINT "Phone_fk" FOREIGN KEY ("id_Phone")
REFERENCES public."Phone" (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: public."User_Email" | type: TABLE --
-- DROP TABLE IF EXISTS public."User_Email" CASCADE;
CREATE TABLE public."User_Email" (
	id serial NOT NULL,
	"primary" boolean NOT NULL DEFAULT false,
	"id_User" integer,
	"id_Email" integer,
	CONSTRAINT "User_Email_pk" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."User_Email" OWNER TO postgres;
-- ddl-end --

-- object: "User_fk" | type: CONSTRAINT --
-- ALTER TABLE public."User_Email" DROP CONSTRAINT IF EXISTS "User_fk" CASCADE;
ALTER TABLE public."User_Email" ADD CONSTRAINT "User_fk" FOREIGN KEY ("id_User")
REFERENCES public."User" (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: "Email_fk" | type: CONSTRAINT --
-- ALTER TABLE public."User_Email" DROP CONSTRAINT IF EXISTS "Email_fk" CASCADE;
ALTER TABLE public."User_Email" ADD CONSTRAINT "Email_fk" FOREIGN KEY ("id_Email")
REFERENCES public."Email" (id) MATCH FULL
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
ALTER TABLE public."Service" OWNER TO postgres;
-- ddl-end --

-- object: "Service_fk" | type: CONSTRAINT --
-- ALTER TABLE public."Task" DROP CONSTRAINT IF EXISTS "Service_fk" CASCADE;
ALTER TABLE public."Task" ADD CONSTRAINT "Service_fk" FOREIGN KEY ("id_Service")
REFERENCES public."Service" (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --


