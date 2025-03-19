-- Enable RLS on tables
ALTER TABLE global_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- Global messages policies
CREATE POLICY "Users can view all global messages"
ON global_messages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own messages"
ON global_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
ON global_messages FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
ON global_messages FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Direct messages policies
CREATE POLICY "Users can view their direct messages"
ON direct_messages FOR SELECT
TO authenticated
USING (
  auth.uid() = sender_id OR 
  auth.uid() = receiver_id
);

CREATE POLICY "Users can insert their own messages"
ON direct_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
ON direct_messages FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages"
ON direct_messages FOR DELETE
TO authenticated
USING (auth.uid() = sender_id); 