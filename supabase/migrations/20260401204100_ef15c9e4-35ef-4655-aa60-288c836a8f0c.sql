CREATE OR REPLACE FUNCTION public.notify_new_ticket()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  agent RECORD;
BEGIN
  FOR agent IN 
    SELECT DISTINCT ur.user_id 
    FROM public.user_roles ur 
    WHERE ur.role IN ('agent', 'manager', 'owner', 'admin')
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
    VALUES (
      agent.user_id,
      'ticket_assignment',
      'New Employee Request',
      'From ' || NEW.name || ': ' || COALESCE(NEW.subject, LEFT(NEW.message, 60)),
      '/manager/employee-requests',
      jsonb_build_object('ticket_id', NEW.id)
    );
  END LOOP;
  RETURN NEW;
END;
$function$;