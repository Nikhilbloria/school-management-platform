INSERT INTO teachers (full_name, email)
VALUES
    ('Demo Teacher One', 'teacher1@example.com'),
    ('Demo Teacher Two', 'teacher2@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO classes (class_name, section)
VALUES
    ('Computer Science', 'A'),
    ('Information Technology', 'B')
ON CONFLICT (class_name, section) DO NOTHING;

INSERT INTO students (full_name, email)
VALUES
    ('Student One', 'student1@example.com'),
    ('Student Two', 'student2@example.com'),
    ('Student Three', 'student3@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO teacher_classes (teacher_id, class_id)
SELECT t.id, c.id
FROM teachers t
CROSS JOIN classes c
WHERE t.email = 'teacher1@example.com'
  AND c.class_name = 'Computer Science'
  AND c.section = 'A'
ON CONFLICT DO NOTHING;

INSERT INTO teacher_classes (teacher_id, class_id)
SELECT t.id, c.id
FROM teachers t
CROSS JOIN classes c
WHERE t.email = 'teacher2@example.com'
  AND c.class_name = 'Information Technology'
  AND c.section = 'B'
ON CONFLICT DO NOTHING;

INSERT INTO class_students (class_id, student_id)
SELECT c.id, s.id
FROM classes c
CROSS JOIN students s
WHERE c.class_name = 'Computer Science'
  AND c.section = 'A'
  AND s.email IN ('student1@example.com', 'student2@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO class_students (class_id, student_id)
SELECT c.id, s.id
FROM classes c
CROSS JOIN students s
WHERE c.class_name = 'Information Technology'
  AND c.section = 'B'
  AND s.email = 'student3@example.com'
ON CONFLICT DO NOTHING;