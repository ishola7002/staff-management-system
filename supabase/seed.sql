-- ============================================
-- 1. Seed colleges
-- ============================================
insert into colleges (name) values
  ('College of Livestock Development & Environmental Sciences'),
  ('College of Agricultural Development & Human Ecology'),
  ('College of Engineering & Technology'),
  ('College of Science & Computing'),
  ('College of Plant Science & Crop Production'),
  ('College of Environmental Design & Geospatial Technology');


-- ============================================
-- 2. Seed departments (linked to their college by name)
-- ============================================

-- College of Livestock Development & Environmental Sciences
insert into departments (college_id, name)
select id, dept_name from colleges,
  (values
    ('Animal Science Department'),
    ('Fisheries & Aquaculture Management Department'),
    ('Forestry & Wildlife Management Department'),
    ('Environmental Management & Toxicology Department')
  ) as d(dept_name)
where colleges.name = 'College of Livestock Development & Environmental Sciences';

-- College of Agricultural Development & Human Ecology
insert into departments (college_id, name)
select id, dept_name from colleges,
  (values
    ('Agricultural Economics Department'),
    ('Agribusiness Department'),
    ('Agricultural Extension & Rural Development Department'),
    ('Human Nutrition & Dietetics Department'),
    ('Hospitality & Tourism Management Department')
  ) as d(dept_name)
where colleges.name = 'College of Agricultural Development & Human Ecology';

-- College of Engineering & Technology
insert into departments (college_id, name)
select id, dept_name from colleges,
  (values
    ('Electrical & Electronics Engineering Department'),
    ('Mechanical Engineering Department'),
    ('Civil Engineering Department'),
    ('Agricultural and Bio-systems Engineering Department'),
    ('Biomedical Engineering Department'),
    ('Mechatronics Engineering Department'),
    ('Food Science and Technology Department')
  ) as d(dept_name)
where colleges.name = 'College of Engineering & Technology';

-- College of Science & Computing
insert into departments (college_id, name)
select id, dept_name from colleges,
  (values
    ('Chemistry Department'),
    ('Microbiology Department'),
    ('Biology Department'),
    ('Physics with Electronics Department'),
    ('Statistics Department'),
    ('Mathematics Department'),
    ('Biochemistry Department'),
    ('Computer Science Department'),
    ('Software Engineering Department'),
    ('Cyber Security Department')
  ) as d(dept_name)
where colleges.name = 'College of Science & Computing';

-- College of Plant Science & Crop Production
insert into departments (college_id, name)
select id, dept_name from colleges,
  (values
    ('Soil Science Department'),
    ('Crop Science Department'),
    ('Horticulture & Landscape Management Department'),
    ('Plant & Environmental Biology Department')
  ) as d(dept_name)
where colleges.name = 'College of Plant Science & Crop Production';

-- College of Environmental Design & Geospatial Technology
insert into departments (college_id, name)
select id, dept_name from colleges,
  (values
    ('Architecture Department'),
    ('Surveying & Geoinformatics Department'),
    ('Industrial Design Department'),
    ('Urban & Regional Planning Department')
  ) as d(dept_name)
where colleges.name = 'College of Environmental Design & Geospatial Technology';


-- ============================================
-- 3. Seed units
-- ============================================
insert into units (name) values
  ('ICT'),
  ('Bursary'),
  ('Library'),
  ('Farm'),
  ('UCH');


-- ============================================
-- 4. Seed designations (starter set, extensible via admin panel)
-- ============================================
insert into designations (title, staff_type) values
  ('Professor', 'teaching'),
  ('Senior Lecturer', 'teaching');