package com.fproj.mytracks.etl

import java.math.BigInteger
import java.security.MessageDigest

import ammonite.ops._

object Processor extends App {

  implicit val wd = pwd

  val inputPath = sys.env.get("GPS_INPUT_PATH") match {
    case Some(str) => Path(str)
    case None => wd/"my-tracks"
  }

  val outputPath = sys.env.get("GPS_OUTPUT_PATH") match {
    case Some(str) => Path(str)
    case None => wd/"out"
  }

  println("!!!!!!!!!!!!")
}
