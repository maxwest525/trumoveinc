
CREATE OR REPLACE FUNCTION public.notify_new_unassigned_lead()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  agent RECORD;
  lead_name TEXT;
BEGIN
  -- Only fire for unassigned leads
  IF NEW.assigned_agent_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  lead_name := NEW.first_name || ' ' || NEW.last_name;

  -- Notify all users with agent/manager/owner roles
  FOR agent IN 
    SELECT DISTINCT ur.user_id 
    FROM public.user_roles ur 
    WHERE ur.role IN ('agent', 'manager', 'owner')
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
    VALUES (
      agent.user_id,
      'incoming_lead',
      'New Incoming Lead',
      lead_name || ' — ' || COALESCE(NEW.origin_address, 'No origin') || ' → ' || COALESCE(NEW.destination_address, 'No destination'),
      '/agent/incoming',
      jsonb_build_object('lead_id', NEW.id, 'source', NEW.source::text)
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_unassigned_lead
  AFTER INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_unassigned_lead();
