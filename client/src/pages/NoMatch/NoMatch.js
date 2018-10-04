import React from "react";
import { Col, Row, Container } from "../../components/Grid";
import Jumbotron from "../../components/Jumbotron";
import { H1 } from '../../components/Headings';

const NoMatch = () =>
  <Container fluid>
    <Row>
      <Col size="sm-10" offset='sm-1'>
        <Jumbotron>
          <H1 className="text-center">Something went wrong...probably 404</H1>
          <H1 className="text-center">
            <span role="img" aria-label="Uh Oh">
              🙄
              <br/>
            </span>
          </H1>
        </Jumbotron>
      </Col>
    </Row>
  </Container>;

export default NoMatch;
