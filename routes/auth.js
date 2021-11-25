import express from "express";
import template from "../template.js";
import {
  list,
  create,
  read,
  update,
  remove,
  userByID,
  signin,
  signout,
  requireSignin,
  getAllStudents,
  getAllInstructors,
  currentStudent,
  currentInstructor,
  currentDean,
} from "../controllers/auth.js";
import {
  addMajor,
  getMajors,
  delMajor,
  updateMajor,
  getMajor,
} from "../controllers/majors.js";
import {
  listCourses,
  postCourse,
  updateCourse,
  delCourse,
  getCourse,
  getCourseByMajor,
  getCourseByInstructor,
} from "../controllers/course.js";

import {
  getClasses,
  addClass,
  delClass,
  updateClass,
  getClassByCode,
  getClassBySName,
  getClassByIName,
  instructorUpdateMarks,
} from "../controllers/class.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).send(template());
});
router.get("/current-student", requireSignin, currentStudent);
router.get("/current-instructor", requireSignin, currentInstructor);
router.get("/current-dean", requireSignin, currentDean);

router.route("/api/users").post(create).get(list);
router.get("/api/students/", getAllStudents);
router.get("/api/instructors/", getAllInstructors);

router
  .route("/api/users/:userId")
  .get(requireSignin, read)
  .put(requireSignin, update)
  .delete(requireSignin, remove);

router.param("userId", userByID);

router.route("/auth/signin").post(signin);
router.route("/auth/signout").get(signout);

router.route("/api/majors").post(addMajor).get(getMajors);
router
  .route("/api/majors/:name")
  .delete(delMajor)
  .put(updateMajor)
  .get(getMajor);

router.route("/api/courses").get(listCourses).post(postCourse);
router
  .route("/api/courses/code/:code")
  .put(updateCourse)
  .get(getCourse)
  .delete(delCourse);
router.get("/api/courses/major/:major", getCourseByMajor);
router.get("/api/courses/instructor/:instructor", getCourseByInstructor);

router
  .route("/api/classes/:name/:yn")
  .get(getClasses)
  .post(addClass)
  .put(updateClass);
router.get("/api/code-classes/:code", getClassByCode);
router.get("/api/student-classes/:name", getClassBySName);
router.get("/api/instructor-classes/:name/:code", getClassByIName);

router
  .route("/api/instructor-classes/:name/:student/:code")
  .put(instructorUpdateMarks);

router.delete("/api/classes/:code/:name", delClass);

export default router;
