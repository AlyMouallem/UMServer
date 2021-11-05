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
  hasAuthorization,
  getAllStudents,
  getAllInstructors,
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
  getClassesDashboard,
  addClass,
  delClass,
  updateClass,
  getClassByCode,
  getClassBySName,
  getClassByIName,
  instructorUpdateMarks,
} from "../controllers/class.js";

const router = express.Router();

router.route("/api/users").post(create).get(list);
router.get("/api/students/", getAllStudents);
router.get("/api/instructors/", getAllInstructors);

router
  .route("/api/users/:userId")
  .get(requireSignin, read)
  .put(requireSignin, hasAuthorization, update)
  .delete(requireSignin, hasAuthorization, remove);

router.param("userId", userByID);

router.get("/", (req, res) => {
  res.status(200).send(template());
});
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
  .get(requireSignin, hasAuthorization, getClasses)
  .post(requireSignin, hasAuthorization, addClass)
  .put(requireSignin, hasAuthorization, updateClass);
router.get(
  "/api/code-classes/:code",
  requireSignin,
  hasAuthorization,
  getClassByCode
);
router.get(
  "/api/student-classes/:name",
  requireSignin,
  hasAuthorization,
  getClassBySName
);
router.get(
  "/api/instructor-classes/:name/:code",
  requireSignin,
  hasAuthorization,
  getClassByIName
);
router.get(
  "/api/:name/:yn",
  requireSignin,
  hasAuthorization,
  getClassesDashboard
);
router
  .route("/api/instructor-classes/:name/:student/:code")
  .put(instructorUpdateMarks);

router.delete("/api/classes/:code/:name", delClass);

export default router;
