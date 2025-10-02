--
-- PostgreSQL database dump
--

\restrict VzjCdOXY0OAVDGeaFkYW0Gc30U96Qf7hhQ8sTk8JTNbit6mZirAtVb15VcrWHhD

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO postgres;

--
-- Name: characters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.characters (
    id integer NOT NULL,
    name character varying(255),
    status character varying(255),
    species character varying(255),
    gender character varying(255),
    origin character varying(255),
    origin_id integer
);


ALTER TABLE public.characters OWNER TO postgres;

--
-- Name: characters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.characters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.characters_id_seq OWNER TO postgres;

--
-- Name: characters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.characters_id_seq OWNED BY public.characters.id;


--
-- Name: origins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.origins (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.origins OWNER TO postgres;

--
-- Name: origins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.origins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.origins_id_seq OWNER TO postgres;

--
-- Name: origins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.origins_id_seq OWNED BY public.origins.id;


--
-- Name: characters id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.characters ALTER COLUMN id SET DEFAULT nextval('public.characters_id_seq'::regclass);


--
-- Name: origins id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.origins ALTER COLUMN id SET DEFAULT nextval('public.origins_id_seq'::regclass);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: characters characters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.characters
    ADD CONSTRAINT characters_pkey PRIMARY KEY (id);


--
-- Name: origins origins_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.origins
    ADD CONSTRAINT origins_name_key UNIQUE (name);


--
-- Name: origins origins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.origins
    ADD CONSTRAINT origins_pkey PRIMARY KEY (id);


--
-- Name: characters_gender; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX characters_gender ON public.characters USING btree (gender);


--
-- Name: characters_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX characters_name ON public.characters USING btree (name);


--
-- Name: characters_origin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX characters_origin ON public.characters USING btree (origin);


--
-- Name: characters_origin_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX characters_origin_id ON public.characters USING btree (origin_id);


--
-- Name: characters_species; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX characters_species ON public.characters USING btree (species);


--
-- Name: characters_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX characters_status ON public.characters USING btree (status);


--
-- Name: origins_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX origins_name ON public.origins USING btree (name);


--
-- Name: characters characters_origin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.characters
    ADD CONSTRAINT characters_origin_id_fkey FOREIGN KEY (origin_id) REFERENCES public.origins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict VzjCdOXY0OAVDGeaFkYW0Gc30U96Qf7hhQ8sTk8JTNbit6mZirAtVb15VcrWHhD

