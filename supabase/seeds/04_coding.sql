-- 04_coding.sql
-- PHASE 2 (P2.1) — seed bai Coding Challenge. Chay SAU 0007_coding.sql va 01_content.sql.
-- Moi bai = 1 question(type='coding') + coding_problems + coding_test_cases (2 mau + 3 an).
-- Idempotent: upsert question theo slug, upsert coding_problems theo question_id, xoa/chen lai test cases.

do $$
declare v_qid uuid; v_pid uuid;
begin
  insert into public.questions (slug, topic_id, type, level, difficulty, frequency, prompt_md, code_language, is_published)
  values ($q$sum-array$q$,
          (select id from public.topics where slug = $t$js-types-coercion$t$),
          'coding', $l$junior$l$, 1, 3, $p$Viết hàm `sumArray(nums)` nhận một mảng số và trả về **tổng** của tất cả phần tử. Mảng rỗng trả về 0.$p$, 'javascript', true)
  on conflict (slug) do update set
    topic_id = excluded.topic_id, level = excluded.level,
    difficulty = excluded.difficulty, prompt_md = excluded.prompt_md
  returning id into v_qid;

  insert into public.coding_problems (question_id, function_name, starter_code, time_limit_ms)
  values (v_qid, $f$sumArray$f$, $s$function sumArray(nums) {
  // code của bạn
}$s$, 3000)
  on conflict (question_id) do update set
    function_name = excluded.function_name, starter_code = excluded.starter_code
  returning id into v_pid;

  delete from public.coding_test_cases where problem_id = v_pid;
  insert into public.coding_test_cases (problem_id, args, expected, is_sample, sort_order) values
    (v_pid, $j$[[1,2,3]]$j$::jsonb, $j$6$j$::jsonb, true, 0),
    (v_pid, $j$[[]]$j$::jsonb, $j$0$j$::jsonb, true, 1),
    (v_pid, $j$[[-5,5,10]]$j$::jsonb, $j$10$j$::jsonb, false, 2),
    (v_pid, $j$[[100]]$j$::jsonb, $j$100$j$::jsonb, false, 3),
    (v_pid, $j$[[1,1,1,1,1]]$j$::jsonb, $j$5$j$::jsonb, false, 4);
end $$;

do $$
declare v_qid uuid; v_pid uuid;
begin
  insert into public.questions (slug, topic_id, type, level, difficulty, frequency, prompt_md, code_language, is_published)
  values ($q$reverse-string$q$,
          (select id from public.topics where slug = $t$js-types-coercion$t$),
          'coding', $l$junior$l$, 1, 3, $p$Viết hàm `reverseString(str)` trả về chuỗi được **đảo ngược**.$p$, 'javascript', true)
  on conflict (slug) do update set
    topic_id = excluded.topic_id, level = excluded.level,
    difficulty = excluded.difficulty, prompt_md = excluded.prompt_md
  returning id into v_qid;

  insert into public.coding_problems (question_id, function_name, starter_code, time_limit_ms)
  values (v_qid, $f$reverseString$f$, $s$function reverseString(str) {
  // code của bạn
}$s$, 3000)
  on conflict (question_id) do update set
    function_name = excluded.function_name, starter_code = excluded.starter_code
  returning id into v_pid;

  delete from public.coding_test_cases where problem_id = v_pid;
  insert into public.coding_test_cases (problem_id, args, expected, is_sample, sort_order) values
    (v_pid, $j$["abc"]$j$::jsonb, $j$"cba"$j$::jsonb, true, 0),
    (v_pid, $j$["hello"]$j$::jsonb, $j$"olleh"$j$::jsonb, true, 1),
    (v_pid, $j$[""]$j$::jsonb, $j$""$j$::jsonb, false, 2),
    (v_pid, $j$["a"]$j$::jsonb, $j$"a"$j$::jsonb, false, 3),
    (v_pid, $j$["12345"]$j$::jsonb, $j$"54321"$j$::jsonb, false, 4);
end $$;

do $$
declare v_qid uuid; v_pid uuid;
begin
  insert into public.questions (slug, topic_id, type, level, difficulty, frequency, prompt_md, code_language, is_published)
  values ($q$fizzbuzz$q$,
          (select id from public.topics where slug = $t$js-scope-closure$t$),
          'coding', $l$junior$l$, 2, 3, $p$Viết hàm `fizzbuzz(n)` trả về mảng từ 1 đến n: bội của 3 → `"Fizz"`, bội của 5 → `"Buzz"`, bội của cả hai → `"FizzBuzz"`, còn lại giữ nguyên **số**.$p$, 'javascript', true)
  on conflict (slug) do update set
    topic_id = excluded.topic_id, level = excluded.level,
    difficulty = excluded.difficulty, prompt_md = excluded.prompt_md
  returning id into v_qid;

  insert into public.coding_problems (question_id, function_name, starter_code, time_limit_ms)
  values (v_qid, $f$fizzbuzz$f$, $s$function fizzbuzz(n) {
  // code của bạn
}$s$, 3000)
  on conflict (question_id) do update set
    function_name = excluded.function_name, starter_code = excluded.starter_code
  returning id into v_pid;

  delete from public.coding_test_cases where problem_id = v_pid;
  insert into public.coding_test_cases (problem_id, args, expected, is_sample, sort_order) values
    (v_pid, $j$[5]$j$::jsonb, $j$[1,2,"Fizz",4,"Buzz"]$j$::jsonb, true, 0),
    (v_pid, $j$[3]$j$::jsonb, $j$[1,2,"Fizz"]$j$::jsonb, true, 1),
    (v_pid, $j$[15]$j$::jsonb, $j$[1,2,"Fizz",4,"Buzz","Fizz",7,8,"Fizz","Buzz",11,"Fizz",13,14,"FizzBuzz"]$j$::jsonb, false, 2),
    (v_pid, $j$[1]$j$::jsonb, $j$[1]$j$::jsonb, false, 3),
    (v_pid, $j$[2]$j$::jsonb, $j$[1,2]$j$::jsonb, false, 4);
end $$;

do $$
declare v_qid uuid; v_pid uuid;
begin
  insert into public.questions (slug, topic_id, type, level, difficulty, frequency, prompt_md, code_language, is_published)
  values ($q$unique-array$q$,
          (select id from public.topics where slug = $t$js-types-coercion$t$),
          'coding', $l$mid$l$, 2, 3, $p$Viết hàm `unique(arr)` trả về mảng mới **bỏ phần tử trùng**, giữ nguyên thứ tự xuất hiện đầu tiên.$p$, 'javascript', true)
  on conflict (slug) do update set
    topic_id = excluded.topic_id, level = excluded.level,
    difficulty = excluded.difficulty, prompt_md = excluded.prompt_md
  returning id into v_qid;

  insert into public.coding_problems (question_id, function_name, starter_code, time_limit_ms)
  values (v_qid, $f$unique$f$, $s$function unique(arr) {
  // code của bạn
}$s$, 3000)
  on conflict (question_id) do update set
    function_name = excluded.function_name, starter_code = excluded.starter_code
  returning id into v_pid;

  delete from public.coding_test_cases where problem_id = v_pid;
  insert into public.coding_test_cases (problem_id, args, expected, is_sample, sort_order) values
    (v_pid, $j$[[1,1,2,3,3]]$j$::jsonb, $j$[1,2,3]$j$::jsonb, true, 0),
    (v_pid, $j$[["a","b","a"]]$j$::jsonb, $j$["a","b"]$j$::jsonb, true, 1),
    (v_pid, $j$[[]]$j$::jsonb, $j$[]$j$::jsonb, false, 2),
    (v_pid, $j$[[5,5,5]]$j$::jsonb, $j$[5]$j$::jsonb, false, 3),
    (v_pid, $j$[[3,1,2,1,3]]$j$::jsonb, $j$[3,1,2]$j$::jsonb, false, 4);
end $$;

do $$
declare v_qid uuid; v_pid uuid;
begin
  insert into public.questions (slug, topic_id, type, level, difficulty, frequency, prompt_md, code_language, is_published)
  values ($q$flatten-array$q$,
          (select id from public.topics where slug = $t$js-patterns-memory$t$),
          'coding', $l$mid$l$, 3, 3, $p$Viết hàm `flatten(arr)` **làm phẳng sâu** một mảng lồng nhau nhiều tầng thành mảng một chiều, giữ thứ tự.$p$, 'javascript', true)
  on conflict (slug) do update set
    topic_id = excluded.topic_id, level = excluded.level,
    difficulty = excluded.difficulty, prompt_md = excluded.prompt_md
  returning id into v_qid;

  insert into public.coding_problems (question_id, function_name, starter_code, time_limit_ms)
  values (v_qid, $f$flatten$f$, $s$function flatten(arr) {
  // code của bạn
}$s$, 3000)
  on conflict (question_id) do update set
    function_name = excluded.function_name, starter_code = excluded.starter_code
  returning id into v_pid;

  delete from public.coding_test_cases where problem_id = v_pid;
  insert into public.coding_test_cases (problem_id, args, expected, is_sample, sort_order) values
    (v_pid, $j$[[1,[2,[3]]]]$j$::jsonb, $j$[1,2,3]$j$::jsonb, true, 0),
    (v_pid, $j$[[[1],[2],[3]]]$j$::jsonb, $j$[1,2,3]$j$::jsonb, true, 1),
    (v_pid, $j$[[1,[2,[3,[4,[5]]]]]]$j$::jsonb, $j$[1,2,3,4,5]$j$::jsonb, false, 2),
    (v_pid, $j$[[]]$j$::jsonb, $j$[]$j$::jsonb, false, 3),
    (v_pid, $j$[[1,2,3]]$j$::jsonb, $j$[1,2,3]$j$::jsonb, false, 4);
end $$;

